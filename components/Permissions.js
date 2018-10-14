import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'

import Error from './ErrorMessage'
import Table from './styles/Table'
import SickButton from './styles/SickButton'

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION($permissions: [Permission]!, $userId: ID!) {
    updatePermissions(permissions: $permissions, userId:  $userId) {
      id
      name
      email
      permissions
    }
  }
`

// In production maybe should query the back end for these permissions ?
// or maybe that's too many db calls everywhere
const permissions = ['USER', 'ADMIN', 'ITEMCREATE', 'ITEMUPDATE', 'ITEMDELETE', 'PERMISSIONUPDATE']

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({data, loading, error}) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {permissions.map(p => (
                  <th key={p + 'header'}>{p}</th>
                ))}
                <th>-</th>
              </tr>
            </thead>
            <tbody>
              {data.users && data.users.map(user => <UserPermissions key={user.id} user={user} />)}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
)

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired
  }

  // Don't normally set state from props... Ok in this instance
  // Because we're just seeding data that will only ever be changed 
  // Inside this component, no changes will come from above
  // And if they did it wouldn't matter
  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = e => {
    let newState
    if(e.target.checked) {
      newState = [...this.state.permissions, e.target.value]
      this.setState({ permissions: newState })
    } else {
      newState = this.state.permissions.filter(p => p !== e.target.value)
      this.setState({ permissions: newState })

      // If I were trying to call a function here that relied on the state change
      // setstate might not be finished before the functionis run. The solution
      // to this is to call setState with a callback

      /*
      this.setState({ permissions: newState }, function() {
        nowRunAFunCtion()
      })

      OR

      this.setState({ permissions: newState }, nowRunAFunCtion)
      */
    }
  }

  render() {
    const user = this.props.user

    // Need to handle errors better here on update... Can I create a component
    // that catches uncaught errors across the entire app and does fade in fade out message?
    return (
      <Mutation 
        mutation={UPDATE_PERMISSIONS_MUTATION} 
        variables={{
          permissions: this.state.permissions,
          userId: user.id
        }}  
      >
        {(mutationFunction, {error, loading}) => {
          return (
            <>
            {error && (
              <tr><td colSpan="9"><Error error={error} /></td></tr>
            )}
            
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {permissions.map(p => (
                <td key={user.id + p}>
                  <label htmlFor={`${user.id}-permission-${p}`}>
                    <input 
                      id={`${user.id}-permission-${p}`}
                      type="checkbox"
                      checked={this.state.permissions.includes(p)}
                      value={p}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  onClick={() => mutationFunction()}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Update'}
                </SickButton>
              </td>
              
            </tr>
            </>
          )
        }}
      </Mutation>
    )
  }
}

export default Permissions