import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

// REact adopt takes all of our different render prop components
// queries / mutations etc and gives us a single composed component that
// exposes everythung we need
import { adopt } from 'react-adopt'


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

// All the different render prop components we want to compose together
// avoids deeply nested mutations, queries and custom prop componets like
// User

/* if we weren't using proptypes we could just do it like this but 
    proptypes has a fit if we do it this way. Below does the same thing 
    and fixes the proprtye errors,it's just way more verbose 

    const Composed = adopt({
      user: <User />,
      toggleCart: <Mutation mutation={TOGGLE_CART_MUTATION} />,
      localState: <Query query={LOCAL_STATE_QUERY} />
    })
*/

const Composed = adopt({
  user: ({ render }) => <User >{render}</User>,
  toggleCart: ({ render }) => <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>,
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>
})

class Cart extends Component {
  render() {
    return ( 
      <Composed>
        {/* gives us a single object with all the values from each original renderprop component */} 
        {({user, toggleCart, localState}) => {
          const me = user.data.me
          if(!me) return null

          return (
            <CartStyles open={localState.data.cartOpen}>
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
          )
        }}
      </Composed>
    )
  }
}

export default Cart
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION }