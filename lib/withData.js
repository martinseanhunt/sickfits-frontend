import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';

import { LOCAL_STATE_QUERY } from '../components/Cart'

// when managing app state we can either pass props around, 
// Use something like redux on top of apollo
// manage peices of state in apollo

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    // This is for setting up storing local app state in apollo
    clientState: {
      resolvers: {
        Mutation: {
          // destructuring cache from "client" 
          toggleCart(_, variables, { cache }) {
            // read the cartOpen value from cache
            // cant jusst do something like cache.cartOpen
            // we have to use a graph ql query to get data from cache
            // here I'm using the LOCAL_STATE_QUERY from the caart component
            // Not sure if this will work in all use cases... or whether
            // in some cases I'll have to write a seperaae query
            
            // destructuring from 'data'
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY
            })

            // write cart state to opposite of current state 
            const data = {
              data: { cartOpen: !cartOpen }
            }

            cache.writeData(data)

            return data // returning this so our mutation can get data back
          }
        }
      },
      defaults: {
        cartOpen: false,
        itemPagesToRefetch: [],
        itemPageFetched: null
      }
    }
  });
}

export default withApollo(createClient);
