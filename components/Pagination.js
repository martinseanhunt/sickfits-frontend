import React from 'react'
import PaginationStyles from './styles/PaginationStyles'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Head from 'next/head'
import Link from 'next/link'

import { perPage } from '../config'

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`

// REMEMBER prefetch tag on links prerenders the page! Can be used on any link... Massive performance boost

const Pagination = props => (

    <Query query={PAGINATION_QUERY}>
      {({data, loading, error}) => {
        if(loading) return <p>loading</p>
        if(error) return <p>error</p>

        const count = data.itemsConnection.aggregate.count
        const pages = Math.ceil(count / perPage)
        const { page } = props

        return (
          <PaginationStyles>
            <Head>
              <title>Sick Fits! Page {page} of {pages}</title>
            </Head>
            <Link href={{
              pathname: 'items',
              query: { page: page - 1}
            }} prefetch>
              <a className="prev" aria-disabled={page <= 1}>Prev</a>
            </Link>
            <p>Page {page} of {pages}</p>
            <p>{count} items total</p>
            <Link href={{
              pathname: 'items',
              query: { page: page + 1}
            }} prefetch>
              <a className="next" aria-disabled={page >= pages}>Next</a>
            </Link>
          </PaginationStyles>
        )
      }}
    </Query>
)

export default Pagination
export { PAGINATION_QUERY }