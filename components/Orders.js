import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { format, formatDistance } from 'date-fns'
import Link from 'next/link'
import styled from 'styled-components'

import Error from './ErrorMessage'
import OrderItemStyles from './styles/OrderItemStyles'

import formatMoney from '../lib/formatMoney'

// Below is the syntax for when I'm getting an array of Orders.... orders: [Order]!
const ALL_USER_ORDERS_QUERY = gql`
  query ALL_USER_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      charge
      total
      createdAt
      user{ 
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity
      }
    }
  }
`

// BUG should manually add the order in to the orders cache on checkout
// otherwise refresh is needed :) 

export default class OrdersPage extends Component {
  render() {
    return (
      <Query query={ALL_USER_ORDERS_QUERY}>
        {({ data: {orders}, error, loading }) => {
          if(error) return <Error error={error} />
          if(loading) return <p>Loading...</p>

          return (
            <div>
              <h2>My orders - {orders.length} orders</h2>
              <OrderUl>
                {orders.map(order => (
                  <OrderItemStyles key={order.id}>
                    <Link href={{ pathname: '/order', query: { id: order.id} }} >
                      <a>
                        <div className="order-meta">
                          <p>{order.items.reduce((a,b) => a + b.quantity, 0)} Items</p>
                          <p>{order.items.length} Products</p>
                          <p>{formatDistance(order.createdAt, new Date())} ago</p>
                          <p>{formatMoney(order.total)}</p> 
                        </div>
                        <div className="images">
                          {order.items.map(item => (
                            <img key={item.id} src={item.image} alt={item.title} />
                          ))}
                        </div>
                      </a>
                    </Link>
                  </OrderItemStyles>
                ))}
              </OrderUl>
            </div>
          )
        }}
      </Query>
    )
  }
}

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40, 1fr))
`
