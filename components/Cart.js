import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'
import User from './User'
import CartItem from './CartItem'
import CalcTotalPrice from '../lib/calcTotalPrice'
import formatMoney from '../lib/formatMoney'

// Going to query loxal app state with this that is set up in 
// withData.js 

// @client lets apollo know the data is on the client side in the
// local cache (think redux store) it won't try to fetch from back end
const LOCAL_STATE_QUERY = gql`
  query LOCAL_STATE_QUERY {
    cartOpen @client
  }
`

// client mutations need to align with resolvers hooked up in withData.js
const TOGGLE_CART_MUTATION = gql`
 mutation {
   toggleCart @client
 }
`

class Cart extends Component {
  render() {
    return ( 
      <User> 
        {({data: { me }}) => {
          if(!me) return null
          return (
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {(toggleCart) => (
                <Query query={LOCAL_STATE_QUERY}>
                  {({ data }) => (
                    <CartStyles open={data.cartOpen}>
                      <header>
                        <CloseButton 
                          title='close'
                          onClick={toggleCart}>
                          &times;
                        </CloseButton>
                        <Supreme>{me.name}'s' Cart</Supreme>
                        <p>You have {me.cart.length} item{me.cart.length !== 1 && 's' } in your cart</p>
                      </header>
                      <ul>
                        {me.cart.map(cartItem => <CartItem key={cartItem.id} cartItem={cartItem}/>)}
                      </ul>
                      <footer>
                        <p>{formatMoney(CalcTotalPrice(me.cart))}</p>
                        <SickButton>Checkout</SickButton>
                      </footer>
                    </CartStyles>
                    )}
                </Query>  
              )}
            </Mutation>
          )
        }}
        </User>
    )
  }
}

export default Cart
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION }