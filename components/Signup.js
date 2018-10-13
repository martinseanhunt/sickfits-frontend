import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Form from './styles/Form'
import Error from './ErrorMessage'

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`

class Signup extends Component {
  state = {
    name: '',
    email: '',
    password: '',
  }

  handleChange = (e) => this.setState({
    [e.target.name]: e.target.value
  })

  handleSubmit = async (e, signup) => {
    e.preventDefault()
    const res = await signup()
    this.setState({
      name: '',
      email: '',
      password: '',
    })
  }

  render() {
    return (
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
      {(mutationFunction, {data, error, loading}) => {
        // form methods with passwords must always have a post method incase
        // JS fails and it defaults to get, putting th plain password in your url bar! 
        return (
          <Form 
            method="post" 
            onSubmit={e => this.handleSubmit(e, mutationFunction)}>

            <fieldset disabled={loading} aria-busy="loading">
              <h2>Sign up for an account</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input type="email" name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange }></input>
              </label>
              <label htmlFor="name">
                Name
                <input type="text" name="name" placeholder="name" value={this.state.name} onChange={this.handleChange }></input>
              </label>
              <label htmlFor="password">
                Password
                <input type="password" name="password" placeholder="password" value={this.state.password} onChange={this.handleChange}></input>
              </label>
    
              <button type="submit">Signup</button>
            </fieldset>
          </Form>
        )
      }}
      </Mutation>
    )
  }
}

export default Signup