import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'

// The mutation itself can take typed arguments so we can pass in the state
// CREATE_ITEM_MUTATION(incoming args)
// $incomingArg to use in createItem
const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
      title
      description
      price
    }
  }
`

const SINGLE_ITEM_QUERY = gql`
  query($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`

class UpdateItem extends Component {
  state = { }

  onChange = e => {
    const { name, type, value } = e.target
    const val = type === 'number' ? parseFloat(value) : value

    this.setState({ [name]: val })
  }

  onSubmit = async (e, updateItem) => {
    e.preventDefault()
    // this is the mutationFunction renamed to updateItem for clarity
    // passing params directly this time rather than using variables on <Mutation>

    // If there was more going on in local state we could put the changes in this.state.item

    const response = await updateItem({
      variables: {
        id: this.props.id, 
        ...this.state
      }
    }) 

    // Forward them to single item page
    Router.push({
      pathname: '/item',
      query: { id: response.data.updateItem.id }
    })
  }

  render() {
    const { id } = this.props
    const { title, description, price } = this.state
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{id}}>
        {({data, error, loading}) => { 

          if (loading) return <p>Loading...</p>
          if(error) return <p>{error.message}</p>
          if(!data.item) return <p>No item found for id</p>
          
          return ( <Mutation mutation={UPDATE_ITEM_MUTATION}>
            {(mutationFunction, {loading, error}) => (
              <Form onSubmit={e => this.onSubmit(e, mutationFunction)}>
                <h2>Update an Item</h2>
                <Error error={error} />
                <fieldset disabled={loading} aria-busy={loading}>
                  <label htmlFor="title">Title
                  <input 
                    type="text" 
                    placeholder="Title" 
                    name="title" 
                    defaultValue={data.item.title} 
                    required
                    onChange={this.onChange}/>
                  </label>

                  <label htmlFor="description">Description
                  <textarea 
                    placeholder="Description goes here" 
                    name="description" 
                    defaultValue={data.item.description} 
                    required
                    onChange={this.onChange}/>
                  </label>

                  <label htmlFor="price">Price
                  <input 
                    type="number" 
                    placeholder="Price" 
                    name="price" 
                    defaultValue={data.item.price} 
                    required
                    onChange={this.onChange}/>
                  </label>
                  
                  <button type="submit">Sav{loading ? 'ing' : 'e'} Changes</button>

                </fieldset>

              </Form>
            )}
          </Mutation> )
        }}
      </Query>
    )
  }
}

export default UpdateItem
export { UPDATE_ITEM_MUTATION }