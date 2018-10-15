import React, { Component } from 'react'

// Downshift handles a huge amount of stuff for us when making auto seggest searches, 
// makes then accessible and behave well with arrow keys and lots more

// when using downshif code up the interface first, then hook up the query, then implement downshift
// watch the wes bos video if need refresher
import Downshift, { resetIdCounter } from 'downshift'
import Router from 'next/router'

// Apollo consumer exposes the apollo client to us so we can fire off 
// queries ourself, rather than on page load via a render prop component

// If we want easy access to the entire cache is this a good place to get it from ? 
// Or should we stick to readQuery ?

import { ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'
import debounce from 'lodash.debounce'

import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown'

// title_contains and description_contains are coming from prisma
// OR checks if any of the given objects have a match - also coming from prisma
const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(where: { 
        OR : [
          {title_contains: $searchTerm},
          {description_contains: $searchTerm}
        ]
       }) {
      id
      image
      title
    }
  }
`

class Search extends Component {
  state={
    items: [],
    loading: false
  }

  // deboucne stops us from firing off rapid requests to the server,
  // only allows function to fire once it hasn't been called in x milliseconds
  onChange = debounce(async (e, client) => {
    // Manually query Apollo client
    const res = await client.query({ 
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }  
    })

    this.setState({ 
      loading: false,
      items: res.data.items
    })
  }, 350)

  routeToItem = (item) => {
    // gest called when item from dropdown is selected 
    Router.push({
      pathname: '/item',
      query: {
        id: item.id
      }
    })
  }

  render() {
    resetIdCounter() // stops error with downshift and SSR
    return (
      <SearchStyles>
        {/* itemToString sets what gets put in to the search bar on enter / click - coming fro downshift */}
        <Downshift 
          itemToString={item => item === null ? '' : item.title}
          onChange={this.routeToItem}
        > 
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (
            <div>
              <ApolloConsumer>
                {(client) => (
                  <input 
                    { // we use getInput props as it allows downshift do do a load of stuff like 
                      // adding the clicked items text in to the search bar
                      ...getInputProps({
                      onChange: (e) => {
                        // I don't understand what e.persist is doing
                        e.persist()
                        this.setState({ loading: true })
                        this.onChange(e, client)
                      },
                      type: "search",
                      placeholder: "Search for an item",
                      id: "search",
                      className: this.state.loading ? 'loading' : ''
                    })} />
                )}
              </ApolloConsumer>

              { // handles opening / closing of this window and all the acessibility oncerns
                // that go along with that
                isOpen && (
                <DropDown>
                  {this.state.items.map((item, i) => 
                    <DropDownItem 
                      key={item.id}
                      {...getItemProps({ item })}
                      highlighted={i === highlightedIndex} // highlightedIndex coming from downshift
                      // and we're applying prop based styling with styled components
                    >
                      <img width="50" src={item.image} alt={item.title}/>
                      {item.title}
                    </DropDownItem>)}
                    {!this.state.items.length && !this.state.loading && (
                      <DropDownItem>
                        Nothing found for {inputValue}
                      </DropDownItem>
                    )}
                </DropDown>
              )}
              
              </div>
          )}
        </Downshift>
        
      </SearchStyles>
    )
  }
}

export default Search