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

  // This fires once the mutation is complete
  update = (cache, payload, data) => {
    // We're going to find every paginated query of items in our apollo cache and set them
    // to an empty array so hat we know they need to be refetched

    // Work out number of pages based on the aggregate count
    // pulling the count from pagination query
    const count = data.itemsConnection.aggregate.count || 1
    const pages = Math.ceil(count / perPage)

    // Create the relevant query for all pages of data and then delete the
    // items in these parts of the cache so items.js knows to refecth each 
    // page when it is requested

    const queryResults = [...Array(pages)]
      .map((page, index) => {
        cache.writeQuery({
          query: ALL_ITEMS_QUERY,
          variables: {
            skip: index * perPage,
          },
          data: {
            items: []
          }
        })
      })
    
    console.log('setting all paginated pages to be refetched only when neeeded')
  }

  render() {
    const { title, description, image, largeImage, price } = this.state
    return (
      <Query query={PAGINATION_QUERY}>
        {({data}) => (
          <Mutation 
            mutation={CREATE_ITEM_MUTATION} 
            variables={this.state}
            // Try removing all items from cache instead ?
            refetchQueries={[{ query: PAGINATION_QUERY }]}
            // Passing data from PAGINATION_QUERY to an update function
            
            // not currently working becuase setting the state to an 
            // empty array just dletes all items from page.... How to remove 
            // query entirely? 
            
            update={(cache, payload) => this.update(cache, payload, data)}
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