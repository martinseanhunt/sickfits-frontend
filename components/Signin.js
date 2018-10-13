import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
      password
    }
  }
`

class Signin extends Component {
  state = {
    email: '',
    password: '',
  }

  handleChange = (e) => this.setState({
    [e.target.name]: e.target.value
  })

  handleSubmit = async (e, signin) => {
    e.preventDefault()
    const res = await signin()
    console.log(res)
    this.setState({
      email: '',
      password: '',
    })
  }

  render() {
    return (
      <Mutation 
        mutation={SIGNIN_MUTATION} 
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        >
      {(mutationFunction, {data, error, loading}) => {
        // form methods with passwords must always have a post method incase
        // JS fails and it defaults to get, putting th plain password in your url bar! 
        return (
          <Form 
            method="post" 
            onSubmit={e => this.handleSubmit(e, mutationFunction)}>

            <fieldset disabled={loading} aria-busy="loading">
              <h2>Sign in</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input type="email" name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange }></input>
              </label>
              
              <label htmlFor="password">
                Password
                <input type="password" name="password" placeholder="password" value={this.state.password} onChange={this.handleChange}></input>
              </label>
    
              <button type="submit">{loading ? 'Loading...' : 'Sign In!'}!</button>
            </fieldset>
          </Form>
        )
      }}
      </Mutation>
    )
  }
}

export default Signin