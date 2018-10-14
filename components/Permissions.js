import { Query } from 'react-apollo'
import gql from 'graphql-tag'

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

// In production maybe should query the back end for these permissions ?
// or maybe that's too many db calls everywhere
const permissions = ['USER', 'ADMIN', 'ITEMCREATE', 'ITEMUPDATE', 'ITEMDELETE', 'PERMISSIONUPDATE']

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({data, loading, error}) => console.log(data) || (
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
              {data.users && data.users.map(user => <User key={user.id} user={user} />)}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
)

class User extends React.Component {
  render() {
    const user = this.props.user
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {permissions.map(p => (
          <td key={user.id + p}>
            <label htmlFor={`${user.id}-permission-${p}`}>
              <input type="checkbox"/>
            </label>
          </td>
        ))}
        <td><SickButton>Update</SickButton></td>
      </tr>
    )
  }
}

export default Permissions