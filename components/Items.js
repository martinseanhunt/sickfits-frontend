import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag' // allows us to write queriees in template literals
import styled from 'styled-components'

import Item from './Item'

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
      id
      title
      description
      price
      image
      largeImage
    }
  }
`
// Using <Query> component below is populating the query using 
// the renderprop method. This is instead of using a higher order
// component a-la redux

// Below we're destructuring what we need from the payload retuend from the query
// Remember there's loads of other userful stuff contained within the payload

class Items extends Component {
  render() {
    return (
      <Center>
        <Query query={ALL_ITEMS_QUERY}>
          {({data, error, loading}) => {
            if(loading) return <p>Loading...</p>
            if(error) return <p>{error.message}</p>
            return <ItemsList>
              {data.items.map(i => <Item key={i.id} item={i}/>)}
            </ItemsList>
          }}
        </Query>
      </Center>
    )
  }
}

const Center = styled.div`
  text-align: center;
`

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${({ theme }) =>  theme.maxWidth};
  margin: 0 auto;
`

export default Items
export { ALL_ITEMS_QUERY }