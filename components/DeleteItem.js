import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

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
    // OR we could trigger the whole fetch again

    // read cache for items we want - we query it with graphql
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY })

    // Filter the deleted item out of the returned data
    data.items = data.items.filter(i => i.id !== payload.data.deleteItem.id)

    // Put the items back
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data: data })
  }
  
  render() {
    return (
      <Mutation 
        mutation={DELTE_ITEM_MUTATION} 
        variables={{ id: this.props.id }}
        update={this.update}>
        {(deleteItem, { data, error, loading }) => {
          
          if(loading) return <p>Loading...</p>
          if(error) return <p>{error.message}</p>

          return (
            <button onClick={() =>{
              if(confirm('Are you ure you want to delete this?'))
                deleteItem()}
            }>{this.props.children}</button>
          )
        }}
      </Mutation>
    )
  }
}
export default DeleteItem