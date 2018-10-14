import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Form from './styles/Form'
import Error from './ErrorMessage'

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`

class Signin extends Component {
  state = {
    email: '',
  }

  handleChange = (e) => this.setState({
    [e.target.name]: e.target.value
  })

  handleSubmit = async (e, requestReset) => {
    e.preventDefault()
    const res = await requestReset()
    this.setState({ email: '' })
  }

  render() {
    return (
      <Mutation 
        mutation={REQUEST_RESET_MUTATION} 
        variables={this.state}
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
              { // could also grab called instead of data and do !error &!loading & !called
                data && data.requestReset.message && <p>Check your emails for instructions</p> 
              }
              <label htmlFor="email">
                Email
                <input type="email" name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange }></input>
              </label>
        
              <button type="submit">{loading ? 'Loading...' : 'Reset Password!'}!</button>
            </fieldset>
          </Form>
        )
      }}
      </Mutation>
    )
  }
}

export default Signin