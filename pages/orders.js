// NExtJS imports react for us... Why / How ?
import Link from 'next/link'

import PleaseSignIn from '../components/PleaseSignIn'
import Orders from '../components/Orders'

const OrdersPage = props => (
  <PleaseSignIn>
    <Orders />
  </PleaseSignIn>
)

export default OrdersPage