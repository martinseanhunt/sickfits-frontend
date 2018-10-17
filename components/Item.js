import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

import formatMoney from '../lib/formatMoney'
import Title from './styles/Title'
import ItemStyles from './styles/ItemStyles'
import PriceTag from './styles/PriceTag'
import DeleteItem from './DeleteItem'
import AddToCart from './AddToCart'

class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render() {
    const { item, page } = this.props
    return (
      <ItemStyles>
        <img src={item.image || 'https://res.cloudinary.com/martinseanhunt/image/upload/v1539808747/sickfits/kcmpxrm14bizwqxl8ihv.jpg'} alt={item.title} />
        <Title>
          <Link href={{ 
            pathname: '/item',
            query: { id: item.id }
           }}><a>{item.title}</a></Link>
        </Title>
        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <p>{item.description}</p>
        <div className="buttonList">
          <Link href={{ 
            pathname: '/update',
            query: { id: item.id }
           }}><a>Edit</a></Link>
          <AddToCart id={item.id}>Add To Card</AddToCart>
          <DeleteItem id={item.id} page={page}>Delete Item</DeleteItem>
        </div>
      </ItemStyles>
    )
  }
}

export default Item
