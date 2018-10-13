import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { CURRENT_USER_QUERY } from './User'

// Remember to ask for whatever the custom rype returns!
const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_MUTATION {
    signout {
      message
    }
  }
`

class Signout extends Component {
  render() {
    return (
      <Mutation mutation={SIGNOUT_MUTATION} refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
        { (signout, { data, error, loading }) => (
          <button
            onClick={signout}
            aria-busy={loading}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign Out!'}
          </button>
        )} 
      </Mutation>
    )
  }
}

export default Signout