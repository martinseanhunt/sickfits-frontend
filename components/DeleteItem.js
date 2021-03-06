import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { perPage } from '../config'
import { ALL_ITEMS_QUERY } from './Items'

const DELTE_ITEM_MUTATION = gql`
  mutation deleteItem($id: ID!) {
    deleteItem(id:  $id) {
      id
    }
  }
`

class DeleteItem extends Component {
  // This fires once the mutation is complete
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
  
  render() {
    return (
      <Mutation 
        mutation={DELTE_ITEM_MUTATION} 
        variables={{ id: this.props.id }}
        update={this.update}>
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
    )
  }
}
export default DeleteItem