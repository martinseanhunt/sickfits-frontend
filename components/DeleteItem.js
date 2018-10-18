import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'

import { perPage } from '../config'
import { ALL_ITEMS_QUERY } from './Items'
import { PAGINATION_QUERY } from './Pagination'

const DELTE_ITEM_MUTATION = gql`
  mutation deleteItem($id: ID!) {
    deleteItem(id:  $id) {
      id
    }
  }
`

class DeleteItem extends Component {
  /*This fires once the mutation is complete
  update = (cache, payload) => {
    // Cache is the apollo cahce (think redux store)
    // Payload is the data that gets sent back from the mutation

    // Manually update cahce on client (delete item from cache) so it matches server
    // OR we could trigger the whole fetch again with refetchQueries like in CreateItem

    // Get the page that we want to query 
    const queryVars = { skip: (this.props.page - 1) * perPage }

    // read cache for items we want - we query it with graphql
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY, variables: queryVars })

    // Filter the deleted item out of the returned data
    data.items = data.items.filter(i => i.id !== payload.data.deleteItem.id)

    // Put the items back
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data: data, variables: queryVars })
  }
*/
  update = async (cache, payload, paginationData) => {
    // Work out number of pages based on the aggregate count
    // pulling the count from pagination query
    const count = paginationData.itemsConnection.aggregate.count || 1
    const pages = Math.ceil(count / perPage)

    // Save an array containing the page numbers that need to be refetched
    // to our local apollo cache
    const pagesArray = [...Array(pages)].map((page, i) => i + 1) 

    // No need to use a complex mutation for such simple data, just write direct to cache
    // https://www.apollographql.com/docs/react/essentials/local-state.html#direct-writes
    cache.writeData({
      data: {
        itemPagesToRefetch: pagesArray,
        itemPageFetched: null
      }
    })
    
    console.log('setting all paginated pages to be refetched only when neeeded')
  }
  
  render() {
    return (
      <Query query={PAGINATION_QUERY}>
        {pagination => (
          <Mutation 
            mutation={DELTE_ITEM_MUTATION} 
            variables={{ id: this.props.id }}
            refetchQueries={[{ query: PAGINATION_QUERY }]}
            update={(cache, payload) => this.update(cache, payload, pagination.data)}>
            {(deleteItem, { data, error, loading }) => {
              return (
                <button onClick={() =>{
                  if(confirm('Are you ure you want to delete this?'))
                    // One way of catching errors from the back end
                    deleteItem().catch(e => alert(e.message))
                }
                }>{ loading ? 'Loading...' : this.props.children}</button>
              )
            }}
          </Mutation>
        )}
      </Query>
    )
  }
}
export default DeleteItem