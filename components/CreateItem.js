import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'

// The mutation itself can take typed arguments so we can pass in the state
// CREATE_ITEM_MUTATION(incoming args)
// $incomingArg to use in createItem
const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      image: $image
      largeImage: $largeImage
      price: $price
    ) {
      id
    }
  }
`

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: ''
  }

  onChange = e => {
    const { name, type, value } = e.target
    const val = type === 'number' ? parseFloat(value) : value

    this.setState({ [name]: val })
  }

  onSubmit = async (e, createItem) => {
    e.preventDefault()
    // this is the mutationFunction renamed to createItem for clarity
    // it will pass the paramaters set in the <Mutation> compoenent as variables
    const response = await createItem() 

    // Forward them to single item page
    Router.push({
      pathname: '/item',
      query: { id: response.data.createItem.id }
    })
  }

  render() {
    const { title, description, image, largeImage, price } = this.state
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(mutationFunction, {loading, error}) => (
          <Form onSubmit={e => this.onSubmit(e, mutationFunction)}>
            <h2>Sell an Item</h2>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="title">Title
              <input 
                type="text" 
                placeholder="Title" 
                name="title" 
                value={title} 
                required
                onChange={this.onChange}/>
              </label>

              <label htmlFor="description">Description
              <textarea 
                placeholder="Description goes here" 
                name="description" 
                value={description} 
                required
                onChange={this.onChange}/>
              </label>

              <label htmlFor="price">Price
              <input 
                type="number" 
                placeholder="Price" 
                name="price" 
                value={price} 
                required
                onChange={this.onChange}/>
              </label>
              
              <button type="submit">Submit</button>

            </fieldset>

          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem
export { CREATE_ITEM_MUTATION }