import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'
import {
  updateCart,
  getOrderItem,
  updateGuestCartAction,
  deleteProductFromGuestCartAction,
  increaseGuestCartQuantityAction,
  decreaseGuestCartQuantityAction
} from '../store'

class GuestOrderProducts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      totalPrice: this.props.guestCart.totalPrice,
      orderItems: this.props.guestCart.orderItems
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  async componentDidMount() {}

  handleSubmit(event) {
    event.preventDefault()
    let order = {
      id: this.state.orders[0].id,
      totalPrice: this.state.showTotalPrice
    }
    this.props.updateCart(order)
    for (let i = 0; i < this.state.orderItems.length; i++) {
      this.props.updateOrderItems(this.state.orderItems[i])
    }
  }

  calcTotalPrice() {
    let totalPriceShown = this.props.order[0].products.reduce(
      (acc, product) => {
        let subtotal = product.price * this.getQuantity(product.id)
        return acc + subtotal
      },
      0
    )
    this.setState({showTotalPrice: totalPriceShown})
  }

  getQuantity(productId) {
    let quantity = this.props.orderItems
      .filter(orderItem => orderItem.productId === productId)
      .map(orderItem => orderItem.quantity)[0]
    return quantity
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <h5>Total Price: ${this.props.guestCart.totalPrice / 100} </h5>
          <button type="submit" className="save">
            Save
          </button>
          <ul>
            {Object.keys(this.props.guestCart.orderItems).map(productId => {
              const {product, quantity} = this.props.guestCart.orderItems[
                productId
              ]
              return (
                <li key={product.id}>
                  <div className="productItem">
                    <div className="productImage">
                      <img
                        src={`${product.imageUrl}`}
                        width="128px"
                        height="128px"
                      />
                    </div>
                    <div className="productDetails">
                      <div className="productName">
                        <Link to={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                        <div>
                          <button
                            type="button"
                            value={product.id}
                            onClick={() => this.props.deleteProduct(product.id)}
                            className="deleteButton"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="productQuantity">
                        <label>Quantity: {quantity}</label>
                        <input
                          type="button"
                          name="decrease"
                          value="-"
                          onClick={() =>
                            this.props.decreaseGuestQuantity(product.id)
                          }
                        />
                        <button
                          type="button"
                          name="increase"
                          value={product.id}
                          onClick={() =>
                            this.props.increaseGuestQuantity(product.id)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="productPrice">
                      <label>Product Price </label>
                      <h5>${product.price / 100}</h5>
                      <label>Subtotal: </label>
                      <h5>${product.price * quantity / 100}</h5>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </form>
    )
  }
}

const mapStateToProps = state => {
  return {
    guestCart: state.guestCart
  }
}

const mapDispatchToProps = dispatch => ({
  updateCart: state => dispatch(updateCart(state)),
  getOrderItem: id => dispatch(getOrderItem(id)),
  updateGuestCart: state => dispatch(updateGuestCartAction(state)),
  increaseGuestQuantity: productId =>
    dispatch(increaseGuestCartQuantityAction(productId)),
  decreaseGuestQuantity: productId =>
    dispatch(decreaseGuestCartQuantityAction(productId)),
  deleteProduct: productId =>
    dispatch(deleteProductFromGuestCartAction(productId))
})
const ConnectedOrderProducts = connect(mapStateToProps, mapDispatchToProps)(
  GuestOrderProducts
)

export default withRouter(ConnectedOrderProducts)
