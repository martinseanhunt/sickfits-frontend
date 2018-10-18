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
    const { items, pageSet, error } = this.state

    // have we already found, or failed to find, the items in either the cache
    // or the server... if so, don't get stuck in a loop
    const alreadySetForPage = page === pageSet
    if(alreadySetForPage || !client || error) return

    try {
      // Try to read the chache for the items on the current page
      const res = client.readQuery({
        query: ALL_ITEMS_QUERY,
        variables: {
          skip: (page - 1) * perPage,
        }
      })

      // If there are already items in the cache, add them to state to be rendered below
      
      if(res.items.length) {
        console.log('grabbing page' + page + 'from apollo cache')
        return this.setState({ 
          loading: false,
          error: null,
          items: res.items,
          pageSet: page
        })
    }
      
      // if we have a result from the local cache query... and it's an empty array
      // it means we've set the query for this page to an empty array in out apollo cache
      // to indicate we want to refetch it when this page is next requested

      // because this query is now empty we know it needs to be refetched so we 
      // send a query to the DB with the network-only fetch policy. Because our initial 
      // query to the server wasn't network only, the data still sticks around in the cache 
      // and will be grabbed from there when we revisit the page unless we tell it
      // to refetch again by setting it's contents to an empty array!
              
      console.log('refetching page' + page)
      this.fetchItems('network-only')
       
    } catch(e) {
      // If we're here it means there's no query for this page in the cache
      // So we need to fetch the items (for the first time)

      console.log('making first fetch for page' + page)

      this.fetchItems()
    }
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