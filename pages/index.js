import { ApolloConsumer } from 'react-apollo'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Items from '../components/Items'

const GET_ITEM_PAGE_FETCHED = gql`
  {
    itemPageFetched @client
  }
`

// passing the query down as props so it will force a re render of itmes.js when it changes
const Index = props => (
  <Query query={GET_ITEM_PAGE_FETCHED}>
    {({data}) => (
      <ApolloConsumer>
        {client => (
          <div>
            <Items 
              page={parseFloat(props.query.page) || 1} 
              client={client} 
              itemPageFetched={data.itemPageFetched}/>
          </div>
        )}
      </ApolloConsumer>
    )}
  </Query>
)

export default Index