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

const GET_ITEM_PAGES_TO_REFETCH = gql`
  {
    itemPagesToRefetch @client
  }
`

class Items extends Component {
  state = { 
    items: [],
    loading: true,
    error: null,
    pageSet: null
  }

  // Component did update doesn't run on the first mount but we want it to!
  componentDidMount = () => this.componentDidUpdate()

  componentDidUpdate = async () => {
    const { page, client } = this.props
    const { pageSet, error } = this.state

    // have we already found, or failed to find, the items in either the cache
    // or the server for this page? if so, don't get stuck in a loop or create
    // unnececarry calls to the cache
    const alreadySetForPage = page === pageSet
    if(alreadySetForPage || !client || error) return

    // get list of pages that need to be refetched from our apollo cache
    const res =  await client.readQuery({
      query: GET_ITEM_PAGES_TO_REFETCH
    })
    const pagesToRefetch = res.itemPagesToRefetch

    // Is the current page in the list of pages to be refetched ?
    if (pagesToRefetch.includes(page)) {
      console.log('refetching page ' + page)

      // Create query with the network-only fetch policy. This is the trick...
      // Because our initial  query to the server had a fetchPolicy of 'cache-first' this latest 
      // query will save it’s data in to the place of the initial query. 
      // The network-only setting we've used for this query will not be remembered. 
      // So if we leave and come back to this page, it will grab the data from the cache. 
      // Unless we set it to an empty array again!
      this.fetchItems('network-only')
      
      // Remove current page from array of pages to be refetched in cache
      client.writeData({
        data: {
          itemPagesToRefetch: pagesToRefetch.filter(p => p !== page)
        }
      })
    }

    // Otherwise, create a regular query that will either grab from cache or 
    // from network - only if the page hasn't been loaded before!
    console.log('either first fetch or fetching from cache for page ' + page)
    this.fetchItems()
  }

  fetchItems = async (fetchPolichy) => {
    const { page, client } = this.props

    try {
      const newItems = await client.query({ 
        query: ALL_ITEMS_QUERY,
        variables: { skip: ((page - 1) * perPage) },
        fetchPolicy: fetchPolichy || 'cache-first'
      })
      
      return this.setState({
        loading: false,
        items: newItems.data.items,
        pageSet: page
      })
    } catch (errr) {
      console.log('error')
      this.setState({ 
        loading: false,
        error: errr
      })
    }
  }

  render() {
    const { page } = this.props
    return (
      <Center>
        <Pagination page={page} />

            {this.state.loading &&  <p>Loading...</p>}
            {this.state.error && <p>{this.state.error.message}</p>}
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