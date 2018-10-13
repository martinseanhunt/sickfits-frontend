import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'

// These imports are just because I was experimenting with refetchQueries
import { ALL_ITEMS_QUERY } from './Items'
import { PAGINATION_QUERY } from './Pagination'
import { perPage } from '../config'

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

  // Using cloudinary here - if want to do it on server use https://www.npmjs.com/package/multer
  // Not sure if using cloudinary uplaods on the front end is viable in production... How to lock it down?
  uploadFile = async e => {
    const { files } = e.target 
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'sickfits') // corresponds to preset in cloudinary

    // TODO set image uploading state and don't allow form submit until upload is finished

    const res = await fetch('https://api.cloudinary.com/v1_1/martinseanhunt/image/upload',{
      method: 'POST',
      body: data
    })

    const file = await res.json()
    console.log(file)
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    })
  }

  refetchQueries = (data, page) => {
    // Refetch all pages one by one after adding an item - don't do this 
    // if lots of pages - this was just an excercise 
    
    const count = data.itemsConnection.aggregate.count
    const pages = Math.ceil(count / perPage)
    
    // Don't want to do this if there are more than 6 pages or things wll get weird
    // because it will fire off all the network requests for however many pages there are

    if (pages > 5) return []

    // Seriously... don't do this in production
    const queries = [...Array(pages)]
      .map((p, i) => ({
        query: ALL_ITEMS_QUERY, 
        variables: { skip: i * perPage } 
      }))
    
    queries.unshift({ query: PAGINATION_QUERY })
      
    return queries
  }

  render() {
    const { title, description, image, largeImage, price } = this.state
    return (
      <Query query={PAGINATION_QUERY}>
        {({data}) => (
          <Mutation 
            mutation={CREATE_ITEM_MUTATION} 
            variables={this.state}
            refetchQueries={this.refetchQueries(data)}
          >
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

                  <label htmlFor="file">Image
                  <input 
                    type="file" 
                    placeholder="file" 
                    name="file" 
                    onChange={this.uploadFile}/>
                  {this.state.image && <img src={this.state.image} alt="uploaded image"/>}
                  </label>

                  
                  <button type="submit">Submit</button>

                </fieldset>

              </Form>
            )}
          </Mutation>
        )}
      </Query>
    )
  }
}

export default CreateItem
export { CREATE_ITEM_MUTATION }