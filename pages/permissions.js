// NExtJS imports react for us... Why / How ?

import Link from 'next/link'
import Permissions from '../components/Permissions'

import PleaseSignIn from '../components/PleaseSignIn'

const PermissionsPage = props => (
  <PleaseSignIn>
    <Permissions />
  </PleaseSignIn>
)

export default PermissionsPage