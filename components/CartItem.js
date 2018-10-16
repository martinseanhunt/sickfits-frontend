import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import formatMoney from '../lib/formatMoney'
import styled from 'styled-components'
import { CURRENT_USER_QUERY } from './User'

// REFACTOR This query along with the delete item button should really be in it's own 
// component
const DELETE_CART_ITEM_MUTATION = gql`
  mutation DELETE_CART_ITEM_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

class CartItem extends Component {
  // this updarte will be called once we have a resonse from the server
  // from DELETE_CART_ITEM_MUTATION
  // Should also use this approach for adding to cart as it'sa bit sluggish right now
  updateOnDelete = (cache, payload) => {
    console.log()
  
    // read from Apollo cache 
    const data = cache.readQuery({ query: CURRENT_USER_QUERY })
     
    // remove item from cart
    const cartItemId = payload.data.removeFromCart.id // coming back from server
    data.me.cart = data.me.cart.filter(i => i.id !== cartItemId)
  
    console.log(data.me.cart)
  
    // write back to cache
    // using long form { data: data } for added clarity while I'm learning
    cache.writeQuery({ query: CURRENT_USER_QUERY, data: data })
  }
  
  render() {
    const { cartItem } = this.props
    if (!cartItem.item) return <CartItemStyles>
      {/* REFACTOR once the delete button is in its own component 
          import it here too so the message can be dismissed
          could also be good to trigger a mutation in this case to delete
          the item from cart automagically - or deleting an item needs to run a mutation
          to delete from everyones cart and instead leave them with a message
      */}
      <p>This item is no longer available and has been removed from your cart</p>
    </CartItemStyles>
    
    const { image, price, description, title } = cartItem.item
    
    return (
      <Mutation 
        mutation={DELETE_CART_ITEM_MUTATION} 
        variables={{ id: cartItem.id }}

        // wihtout the optimistic response this will be called as soon as the mutation
        // resolves - before anyrefetchqueries update
        update={this.updateOnDelete} 

        // Optimistic response - this fires the update function without even waiting for success
        // from the server. WE just have to mock up what the server would respond with.. 
        // I'm not sure if I'd actually want to use this here but it is defintely going to be
        // useful for other things in production...
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: {
            __typename: 'CartItem',
            id: cartItem.id
          }
        }}
        
        // don't need refetch with above method
        //refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        // awaitRefetchQueries makes sure queries are refetched BEFORE mutation is resolved
        // otherwise there's a delay between removing the item and it leaving the screen
        // awaitRefetchQueries={true} 

        // Disabled because Wes is using adifferent solution - we're updating the cahce
        // manually for deleting a cart item and allowing it to refetch in the background.
      >
        {(deleteCartItem, {error, loading}) => (
          <CartItemStyles>
            <img src={image}></img>
            <div className="cart-titem-details">
              <h3>{title}</h3>
              <p>{formatMoney(cartItem.quantity * price)} - <em>
                {cartItem.quantity} &times; 
                {formatMoney(price)} each
              </em></p>
            </div>
            <BigButton disabled={loading} onClick={deleteCartItem}>Delet{loading ? 'ing' : 'e'} &times;</BigButton>
          </CartItemStyles>
        )}
          
      </Mutation>
    )
  }
}

const BigButton = styled.button`
  font-size: 1.5rem;
  background: none;
  border: 0;
  &:hover {
    color: ${({theme}) => theme.red};
    cursor: pointer;
  }
`

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
    width: 100px;
  }
  h3,
  p {
    margin: 0;
  }
`


export default CartItem