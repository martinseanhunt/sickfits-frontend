import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword( resetToken: $resetToken, 
      password: $password, 
      confirmPassword: $confirmPassword) {
        id
        email
        name
      }
  }
`

class ResetPassword extends Component {
  state = {
    password: '',
    confirmPassword: ''
  }

  handleChange = (e) => this.setState({
    [e.target.name]: e.target.value
  })

  handleSubmit = async (e, resetPassword) => {
    e.preventDefault()
    const res = await resetPassword()
    this.setState({ password: '', confirmPassword: '' })
  }

  render() {
    return (
      <Mutation 
        mutation={RESET_PASSWORD_MUTATION} 
        variables={{
          ...this.state,
          resetToken: this.props.resetToken
        }}
        refetchQueries={[{query: CURRENT_USER_QUERY }]}
        >
      {(mutationFunction, {data, error, loading, called}) => {
        // form methods with passwords must always have a post method incase
        // JS fails and it defaults to get, putting th plain password in your url bar! 
        return (
          <Form 
            method="post" 
            onSubmit={e => this.handleSubmit(e, mutationFunction)}>

            { !error &!loading & called ? (
              <h2>Success, you've been signed in with your new credentials... Don't lose them this time</h2>
            ) : (
              <fieldset disabled={loading} aria-busy="loading">
                <h2>Choose a new password</h2>
                <Error error={error} />
                
                <label htmlFor="password">
                  Password
                  <input type="password" name="password" placeholder="password" value={this.state.password} onChange={this.handleChange }></input>
                </label>

                <label htmlFor="password">
                  Confirm Password
                  <input type="password" name="confirmPassword" placeholder="Confirm Password" value={this.state.confirmPassword} onChange={this.handleChange}></input>
                </label>

                
          
                <button type="submit">{loading ? 'Loading...' : 'Reset Password!'}!</button>
              </fieldset>

            )}
          </Form>
        )
      }}
      </Mutation>
    )
  }
}

export default ResetPassword