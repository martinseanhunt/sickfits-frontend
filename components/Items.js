import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag' // allows us to write queriees in template literals
import styled from 'styled-components'

import Item from './Item'
import Pagination from './Pagination'
import { perPage } from '../config'


const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
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

// Regarding pagination... When we add or remove an item from the list
// It's going to mess up pagination because the pages are cached so won't be
// Re-fetched... There are different ways to deal with this. 

// 1) Set fetchPolicy to network-only on the items query in the Query component - this means that it will
// always be refetched it ewill never use the cache obvious perfomance implications

// 2) Use refetchQueries on adding or removing an item, passing an array to manually trigger a refetch!
// of queries that need to be refetched! - problem is in regards to pagination we'd need to pass all the 
// exact queries that need to be refetched including skip and perpage values!

// 3) Delete items from the apollo cache on adding or removing item. currently no way to delte part of the 
// cache and no way to auto refetch after x time

// Apparantly this is something that apollo are figuring out how to solva right now. - Wes will update us

// I'm experimenting with #2 in CreateItem.js this wouldn't work on a large scale though - could do the same
// for DeleteItem


class Items extends Component {
  render() {
    const { page } = this.props
    return (
      <Center>
        <Pagination page={page} />
        <Query query={ALL_ITEMS_QUERY} variables={{ skip: ((page - 1) * perPage) }}>
          {({data, error, loading}) => {
            if(loading) return <p>Loading...</p>
            if(error) return <p>{error.message}</p>
            return <ItemsList>
              {data.items.map(i => <Item key={i.id} item={i} page={page}/>)}
            </ItemsList>
          }}
        </Query>
        <Pagination page={page}/>
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