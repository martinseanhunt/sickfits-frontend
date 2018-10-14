import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import propTypes from 'prop-types'

// We're stopping the password and other sensitive data coming through on the back end
// in schema.graphql

const CURRENT_USER_QUERY = gql`
  query CURRENT_USER_QUERY {
    me {
      name
      email
      id
      permissions
    }
  }
`

// This component is our own render prop component. 
// It fires the query and gives the payload the child function that
// must be provided

// Also we're passing down any props provided to user component
const User = props => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
)

User.propTypes = {
  children: propTypes.func.isRequired
}

export default User
export { CURRENT_USER_QUERY }