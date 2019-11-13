import React, {Component} from 'react'
import {connect} from 'react-redux'
import {fetchProduct} from '../store/product'
import {getCart, addProductToCart, addProductToGuestCart} from '../store'

class SingleProduct extends Component {
  constructor(props) {
    super(props)
    this.state = {
      quantity: '',
      orderId: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    if (this.props.userId) {
      this.props.addProductToCart(
        this.state.orderId,
        this.props.match.params.id,
        Number(this.state.quantity)
      )
    } else {
      this.props.addProductToGuestCart(
        this.props.match.params.id,
        Number(this.state.quantity)
      )
    }

    this.setState({
      quantity: ''
    })
  }

  async componentDidMount() {
    await this.props.fetchProduct(this.props.match.params.id)
    if (this.props.userId) {
      await this.props.getCart(this.props.userId)
    }
    this.setState({orderId: this.props.order[0].id})
  }

  render() {
    return (
      <table className="single-product-body">
        <tbody>
          {this.props.products.productList.map(product => (
            <tr key={product.id}>
              <img src={product.imageUrl} width="150" height="150" />
              <td>{`Name: ${product.name}`}</td>
              <td>{`Description: ${product.description}`}</td>
              <td>{`Price: $${product.price / 100.0}`}</td>
            </tr>
          ))}
        </tbody>
        <div>
          <label>
            Quantity:
            <input
              type="integer"
              name="quantity"
              onChange={this.handleChange}
              value={this.state.quantity}
            />
          </label>
          <form onSubmit={this.handleSubmit}>
            <button type="submit">Add to Cart</button>
          </form>
        </div>
      </table>
    )
  }
}

const mapStateToProps = state => ({
  products: state.products,
  userId: state.user.id,
  order: state.order
})

const mapDispatchToProps = dispatch => ({
  fetchProduct: id => dispatch(fetchProduct(id)),
  getCart: id => dispatch(getCart(id)),
  addProductToCart: (orderId, productId, quantity) =>
    dispatch(addProductToCart(orderId, productId, quantity)),
  addProductToGuestCart: (productId, quantity) =>
    dispatch(addProductToGuestCart(productId, quantity))
})

export default connect(mapStateToProps, mapDispatchToProps)(SingleProduct)
