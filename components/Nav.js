import Link from 'next/link'
import { Mutation } from 'react-apollo'

import NavStyles from './styles/NavStyles'
import User from './User'
import Signout from './Signout'
import { TOGGLE_CART_MUTATION } from './Cart'
import CartCount from './CartCount'

// babel 7 turns <></> in to React.Fragment - very cool

const Nav = () => 
  <User>
    {({data: { me }}) => (
      <NavStyles>
        <Link href="/"><a>Home</a></Link>
        <Link href="/items"><a>Shop</a></Link>

        {me ? (
          <>
            <Link href="/sell"><a>Sell</a></Link>
            <Link href="/orders"><a>Orders</a></Link>
            <Link href="/me"><a>Account</a></Link>
            <Signout />
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {(toggleCart) => (
                <button onClick={toggleCart}>
                  View Cart
                  {/* Looping through cart items in cache to count all sub items */}
                  <CartCount count={me.cart.reduce((tally, cartItem)=> tally + cartItem.quantity ,0)} />
                </button>
              )}
            </Mutation>
          </>
        ) : (
          <Link href="/signup"><a>Signup</a></Link>
        )}
      </NavStyles>
    )}
  </User>
 


export default Nav