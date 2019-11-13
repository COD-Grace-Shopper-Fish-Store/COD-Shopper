import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'
import {
  updateCart,
  submitCart,
  getOrderItem,
  updateOrderItems,
  increaseQuantity,
  decreaseQuantity
} from '../store'

class OrderProducts extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getQuantity = this.getQuantity.bind(this)
  }

  async componentDidMount() {
    await this.props.getOrderItem(this.props.order[0].id)
  }

  handleSubmit(event) {
    // if(event.MouseEvent.target.button === 'submit'){
    //   console.log('<<<<<<<event: ', event, obj)
    // }

    let order = {
      id: this.props.order[0].id,
      totalPrice: this.props.order[0].totalPrice
    }
    if (event.target.name === 'checkout') {
      event.preventDefault()
      this.props.updateCart(order)
      this.props.updateOrderItems(this.props.orderItems)
      this.props.submitCart(order)
      this.props.createCart(this.props.order[0].userId)
    } else if (event.target.name === 'save') {
      event.preventDefault()
      this.props.updateCart(order)
      this.props.updateOrderItems(this.props.orderItems)
    }
  }

  getQuantity(productId) {
    let quantity = this.props.orderItems
      .filter(orderItem => orderItem.productId === productId)
      .map(orderItem => orderItem.quantity)[0]
    return quantity
  }

  render() {
    if (this.props.order) {
      return (
        <form onSubmit={this.handleSubmit}>
          <div>
            <h5>Total Price: ${this.props.order[0].totalPrice / 100} </h5>
            <button
              type="submit"
              name="save"
              className="save"
              onClick={event => this.handleSubmit(event)}
            >
              Save
            </button>
            <button
              type="submit"
              name="checkout"
              className="submit"
              onClick={event => this.handleSubmit(event)}
            >
              Checkout
            </button>
            <ul>
              {this.props.order[0].products.map(product => (
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
                            onClick={this.props.deleteProductHandler}
                            className="deleteButton"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="productQuantity">
                        <label>Quantity: {this.getQuantity(product.id)}</label>
                        <input
                          type="button"
                          name="decrease"
                          value="-"
                          onClick={() =>
                            this.props.decreaseQuantity(product.id)
                          }
                        />
                        <input
                          type="button"
                          name="increase"
                          value="+"
                          onClick={() =>
                            this.props.increaseQuantity(product.id)
                          }
                        />
                      </div>
                    </div>
                    <div className="productPrice">
                      <label>Price per item: </label>
                      <h5>${product.price / 100}</h5>
                      <label>Subtotal: </label>
                      <h5>
                        ${product.price * this.getQuantity(product.id) / 100}
                      </h5>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </form>
      )
    } else {
      return <h4>Your cart is empty </h4>
    }
  }
}

const mapStateToProps = state => {
  return {
    order: state.order,
    orderItems: state.orderItem
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateCart: state => dispatch(updateCart(state)),
    getOrderItem: id => dispatch(getOrderItem(id)),
    updateOrderItems: state => dispatch(updateOrderItems(state)),
    increaseQuantity: productItem => dispatch(increaseQuantity(productItem)),
    decreaseQuantity: productItem => dispatch(decreaseQuantity(productItem)),
    submitCart: state => dispatch(submitCart(state))
  }
}
const ConnectedOrderProducts = connect(mapStateToProps, mapDispatchToProps)(
  withRouter(OrderProducts)
)

export default ConnectedOrderProducts
