import React from 'react'
import {fetchProducts} from '../store/product'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

class AllProducts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filtered: this.props.products.productList
    }
    this.handleChange = this.handleChange.bind(this)
  }
  async componentDidMount() {
    await this.props.fetchProducts()
  }

  handleChange(e) {
    // Variable to hold the original version of the list
    let currentList = []
    // Variable to hold the filtered list before putting into state
    let newList = []

    // If the search bar isn't empty
    if (e.target.value !== '') {
      // Assign the original list to currentList
      currentList = this.props.products.productList

      // Use .filter() to determine which items should be displayed
      // based on the search terms
      newList = currentList.filter(item => {
        // change current item to lowercase
        const lc = item.name.toLowerCase()
        // change search term to lowercase
        const filter = e.target.value.toLowerCase()
        // check to see if the current list item includes the search term
        // If it does, it will be added to newList. Using lowercase eliminates
        // issues with capitalization in search terms and search content
        return lc.includes(filter)
      })
    } else {
      // If the search bar is empty, set newList to original task list
      newList = this.props.products.productList
    }
    // Set the filtered state based on what our rules added to newList
    this.setState({
      filtered: newList
    })
    console.log(this.state.filtered)
  }
  render() {
    return (
      <div className="all-products-body">
        <h1>All the fishies!</h1>
        <input
          type="text"
          className="input"
          onChange={this.handleChange}
          placeholder="Search..."
        />
        <ul>
          {this.state.filtered.map(product => (
            <li key={product.id}>
              <Link to={`/products/${product.id}`}>{product.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  products: state.products
})

const mapDispatchToProps = dispatch => ({
  fetchProducts: () => dispatch(fetchProducts())
})

export default connect(mapStateToProps, mapDispatchToProps)(AllProducts)
