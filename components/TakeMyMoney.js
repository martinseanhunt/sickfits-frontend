import React, { Component } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'

import calcTotalPrice from '../lib/calcTotalPrice'
import Error from './ErrorMessage'
import User, { CURRENT_USER_QUERY } from './User'

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      total
      charge
    }
  }
`

class TakeMyMoney extends Component {
  // BUG: Cart quantity is counted if the item has been deleted
  totalItems = (cart) => cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
  
  onToken = (res, createOrder) => {
    // manually calling mutation up here with stripe token as variable
    createOrder({
      variables: {
        token: res.id
      }
    }).catch(err => {
      alert(err.message)
    })
  }
  
  render() {
    return (
      <Mutation 
        mutation={CREATE_ORDER_MUTATION}
        refetchQueries={[{query: CURRENT_USER_QUERY}]}
      > 
        {(createOrder, { data, loading, error }) => (
          <div>
            <User>
              {({ data: { me } }) => (
                //{/* IRL: INclide address info to stop declines */}
                <StripeCheckout
                  amount={calcTotalPrice(me.cart)}
                  name="Sick Fits"
                  description={`Order of ${this.totalItems(me.cart)} items`}
                  image={me.cart[0] && me.cart[0].item.image}
                  stripeKey="pk_test_VZxFTmFf4SJGOtEcAE5KbY6x" // REFACTOR move to env variable
                  currency="USD"
                  email={me.email}
                  token={res => this.onToken(res, createOrder)}
                >
                  {this.props.children}
                </StripeCheckout>
              )}
            </User>
          </div>
        )}
      </Mutation>
    )
  }
}

export default TakeMyMoney