import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  createCart,
  getCart,
  deleteProductFromCart,
  cartCreatedAction
} from '../store'
import OrderProducts from './order-products'

/**
 * COMPONENT
 */
class UserHome extends React.Component {
  constructor() {
    super()

    this.deleteProductHandler = this.deleteProductHandler.bind(this)
  }
  async componentDidMount() {
    await this.props.getCart(this.props.userId)
    console.log('userID is', this.props.userId)
  }

  async componentDidUpdate() {
    if (!this.props.orders.cartCreated) {
      if (this.props.orders[0].orderSubmittedDate !== null) {
        console.log('ordersubmitted if hit, userId: ', this.props.userId)
        await this.props.createCart(this.props.userId)
      }
    }
  }

  deleteProductHandler(evt) {
    this.props.deleteProduct(
      Number(evt.currentTarget.value),
      this.props.orders[0].id
    )
  }

  render() {
    let order = this.props.orders[0]
    if (order) {
      return (
        <div>
          <h3>Welcome, {this.props.user.firstName}</h3>
          <h4>Your Shopping Cart: </h4>
          <div>
            <OrderProducts
              order={order}
              deleteProductHandler={this.deleteProductHandler}
              createCart={this.props.createCart}
            />
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <h3>Welcome, {this.props.user.firstName}</h3>
          <h4>Your Shopping Cart: </h4>
        </div>
      )
    }
  }
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    user: state.user,
    email: state.user.email,
    userId: state.user.id,
    orderId: state.order.id,
    orders: state.order
  }
}

const mapDispatch = dispatch => ({
  getCart: id => dispatch(getCart(id)),
  createCart: id => dispatch(createCart(id)),
  deleteProduct: (productId, orderId) =>
    dispatch(deleteProductFromCart(productId, orderId)),
  cartCreated: () => dispatch(cartCreatedAction())
})

export default connect(mapState, mapDispatch)(UserHome)

/**
 * PROP TYPES
 */
UserHome.propTypes = {}
