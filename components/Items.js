import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag' // allows us to write queriees in template literals
import styled from 'styled-components'

import Item from './Item'
import Pagination from './Pagination'
import { perPage } from '../config'


const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) @connection(key: "ItemPages", filter: ["skip"]) {
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

// What happens if we just delete all the items from each query in the cache? 
// We're left with an ampty page on adding an item because it just deltes the items, not the query itself!

// maybe @connection is the answer! set @connection when you fetch the items with ALL_ITEMS_QUERY
// does deleteing the items jhust do the same as above though!? YEP!

class Items extends Component {
  state = { 
    items: [],
    loading: true,
    error: null,
    pageSet: null
  }

  componentDidMount = () => this.componentDidUpdate()

  componentDidUpdate = async () => {
    const { page, client } = this.props
    const { items, pageSet } = this.state

    try {
      const res = client.readQuery({
        query: gql`
          query CACHED_ITEMS{
            items(skip: $skip) @connection(key: "ItemPages", filter: ["skip"]) {
              id  
            }
          }
        `,
        variables: {
          skip: (page - 1) * perPage,
        }
      })

      // If there are already items in the cache, cool! Add them to state to be rendered below
      // unless the items have already been set for this page becausew we'll get stuck in a loop
      const alreadySetForPage = page === pageSet
      console.log(alreadySetForPage)
      if(res.items.length && !alreadySetForPage) {
        console.log('items already in cache')

        this.setState({ 
          loading: false,
          error: null,
          items: res.items,
          pageSet: page
        })
      } 
      
      /*{
        // Otherwise it means we've cleared out the items for this page to an empty array so we need to refetch :D
        console.log('items need refetching')
      }*/

       
    } catch(e) {
      // If we're here it means there's no queryt for this page in the cache
      // So we need to fetch the items (for the first time)

      console.log('making first fetch')

      const items = await client.query({ 
        query: ALL_ITEMS_QUERY,
        variables: { skip: ((page - 1) * perPage) }
      }).catch(error => {
        console.log('error')
        this.setState({ 
          loading: false,
          error: error
         })
      })
      
      this.setState({
        loading: false,
        items: items.data.items,
        pageSet: page
      })

    }
  }

  render() {
    const { page } = this.props
    return (
      <Center>
        <Pagination page={page} />

            {this.state.loading &&  <p>Loading...</p>}
            {this.state.error && <p>{error.message}</p>}
            {!this.state.error && !this.state.loading && (
              <ItemsList>
                {(this.state.items.length > 0) && this.state.items.map(i => <Item key={i.id} item={i} page={page}/>)}
              </ItemsList>
            )}

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