// NExtJS imports react for us... Why / How ?

import Link from 'next/link'

import PleaseSignIn from '../components/PleaseSignIn'
import CreateItem from '../components/CreateItem'

const Sell = props => (
  <PleaseSignIn>
    <CreateItem page={parseFloat(props.query.page) || 1}/>
  </PleaseSignIn>
)

export default Sell