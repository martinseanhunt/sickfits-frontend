// NExtJS imports React for us... Why / How ?

import Link from 'next/link'

import Items from '../components/Items'

const Index = props => (
  <div>
    <Items page={parseFloat(props.query.page) || 1} client={props.client}/>
  </div>
)

export default Index