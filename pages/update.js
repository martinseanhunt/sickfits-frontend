import Link from 'next/link'

import UpdateItem from '../components/UpdateItem'

// Query params are only avaiable at the page level by default
// TO give them to lower levels we can either...
// export Update using the withRouter HOC
// pass it down via props because we passed it down from _app.js

const Update = props => (
  <div>
    <UpdateItem id={props.query.id}/>
  </div>
)

export default Update