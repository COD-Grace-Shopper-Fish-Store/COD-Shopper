import axios from 'axios'
import {runInContext} from 'vm'

/*
 * ACTION TYPES
 */
const CREATE_CART = 'CREATE_CART'
const GET_CART = 'GET_CART'
const DELETE_PRODUCT_FROM_CART = 'DELETE_PRODUCT_FROM_CART'
const GET_ORDERITEM = 'GET_ORDERITEM'
const UPDATE_CART = 'UPDATE_CART'
const UPDATE_TOTAL_PRICE = 'UPDATE_TOTAL_PRICE'

/**
 * INITIAL STATE
 */
const defaultOrder = {}

/**
 * ACTION CREATORS
 */

const createCartAction = totalPrice => ({type: CREATE_CART, totalPrice})
const getCartAction = orderProducts => ({type: GET_CART, orderProducts})
const getOrderItemAction = orderItems => ({type: GET_ORDERITEM, orderItems})
const updateCartAction = order => ({type: UPDATE_CART, order})
const deleteProductFromCartAction = productId => ({
  type: DELETE_PRODUCT_FROM_CART,
  productId
})
export const updateTotalPriceAction = totalPrice => ({
  type: UPDATE_TOTAL_PRICE,
  totalPrice
})

/**
 * THUNK CREATORS
 */

export const updateTotalPrice = () => (dispatch, getState) => {
  const {orderItem, order} = getState()

  let totalPrice = order[0].products.reduce((acc, product) => {
    let newQuantity = orderItem
      .filter(eaOrderItem => eaOrderItem.productId === product.id)
      .map(eaOrderItem => eaOrderItem.quantity)[0]
    let subtotal = product.price * newQuantity
    return acc + subtotal
  }, 0)
  dispatch(updateTotalPriceAction(totalPrice))
}

export const getCart = userId => async dispatch => {
  try {
    const response = await axios.get(`/api/orders/${userId}/getCart`)
    dispatch(getCartAction(response.data))
  } catch (err) {
    console.error(err)
  }
}

export const submitCart = order => async () => {
  try {
    await axios.put(`/api/orders/submitOrder/${order.id}`)
  } catch (err) {
    console.error(err)
  }
}

export const updateCart = order => async dispatch => {
  try {
    const response = await axios.put(
      `/api/orders/updateOrder/${order.id}/${order.totalPrice}`
    )
    dispatch(updateCartAction(response.data))
  } catch (err) {
    console.error(err)
  }
}

export const getOrderItem = orderId => async dispatch => {
  try {
    const response = await axios.get(`/api/orders/orderItems/${orderId}`)
    dispatch(getOrderItemAction(response.data))
  } catch (err) {
    console.error(err)
  }
}

export const createCart = userId => async dispatch => {
  try {
    const response = await axios.post(`/api/orders/`, {userId})
    dispatch(createCartAction(response.data))
  } catch (err) {
    console.error(err)
  }
}

export const deleteProductFromCart = (productId, orderId) => async (
  dispatch,
  getState
) => {
  try {
    console.log('in ACTION, productID: ', productId, 'orderId: ', orderId)
    const response = await axios.delete('/api/orders/deleteitem', {
      data: {
        productId: productId,
        orderId: orderId
      }
    })
    const userId = getState().user.id
    await dispatch(deleteProductFromCartAction(productId))
    try {
      const response = await axios.get(`/api/orders/${userId}/getCart`)
      dispatch(getCartAction(response.data))
    } catch (err) {
      console.error(err)
    }
  } catch (err) {
    console.error(err)
  }
}

/**
 * REDUCER
 */
export default function(state = defaultOrder, action) {
  Object.freeze(state)
  switch (action.type) {
    case CREATE_CART:
      return {...state, totalPrice: action.totalPrice, cartCreated: true}
    case GET_CART:
      return {
        ...state,
        ...action.orderProducts,
        totalPrice: action.orderProducts[0].totalPrice
      }
    case DELETE_PRODUCT_FROM_CART:
      let newState = {
        0: {
          ...state[0],
          products: state[0].products.filter(
            product => product.id !== action.productId
          )
        }
      }
      return newState
    case UPDATE_TOTAL_PRICE:
      return {...state, totalPrice: action.totalPrice}

    default:
      return state
  }
}
