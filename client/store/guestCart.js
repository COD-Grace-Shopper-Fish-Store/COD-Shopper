import axios from 'axios'

const DELETE_PRODUCT_FROM_GUEST_CART = 'DELETE_PRODUCT_FROM_GUEST_CART'
const ADD_PRODUCT_TO_GUEST_CART = 'ADD_PRODUCT_TO_GUEST_CART'
const INCREASE_GUEST_CART_QUANTITY = 'INCREASE_GUEST_CART_QUANTITY'
const DECREASE_GUEST_CART_QUANTITY = 'DECREASE_GUEST_CART_QUANTITY'
const UPDATE_GUEST_CART = 'UPDATE_GUEST_CART'

const initialState = {
  totalPrice: 0,
  orderItems: []
}

export const increaseGuestCartQuantityAction = productId => ({
  type: INCREASE_GUEST_CART_QUANTITY,
  productId
})

export const decreaseGuestCartQuantityAction = productId => ({
  type: DECREASE_GUEST_CART_QUANTITY,
  productId
})

const addProductToGuestCartAction = (product, quantity) => ({
  type: ADD_PRODUCT_TO_GUEST_CART,
  product,
  quantity
})

export const deleteProductFromGuestCartAction = productId => ({
  type: DELETE_PRODUCT_FROM_GUEST_CART,
  productId
})

export const addProductToGuestCart = (
  productId,
  quantity
) => async dispatch => {
  try {
    // console.log('ORDER ID IS: ', orderId)
    const response = await axios.get(`/api/products/${productId}`)
    dispatch(addProductToGuestCartAction(response.data[0], quantity))
  } catch (err) {
    console.error(err)
  }
}
const computeTotalPrice = state => {
  return Object.values(state.orderItems).reduce((total, currOrderItem) => {
    return total + currOrderItem.product.price * currOrderItem.quantity
  }, 0)
}

export default function(state = initialState, action) {
  Object.freeze(state)
  switch (action.type) {
    case ADD_PRODUCT_TO_GUEST_CART:
      let newState = {
        ...state,
        orderItems: {
          ...state.orderItems,
          [action.product.id]: {
            product: action.product,
            quantity: action.quantity
          }
        }
      }
      newState.totalPrice = computeTotalPrice(newState)
      return newState
    case INCREASE_GUEST_CART_QUANTITY:
      newState = {
        ...state,
        orderItems: {
          ...state.orderItems,
          [action.productId]: {
            ...state.orderItems[action.productId],
            quantity: state.orderItems[action.productId].quantity + 1
          }
        }
      }
      newState.totalPrice = computeTotalPrice(newState)
      return newState
    case DECREASE_GUEST_CART_QUANTITY:
      newState = {
        ...state,
        orderItems: {
          ...state.orderItems,
          [action.productId]: {
            ...state.orderItems[action.productId],
            quantity: state.orderItems[action.productId].quantity - 1
          }
        }
      }
      newState.totalPrice = computeTotalPrice(newState)
      return newState
    case UPDATE_GUEST_CART:
      return action.newCart
    case DELETE_PRODUCT_FROM_GUEST_CART:
      newState = {orderItems: {}, totalPrice: 0}
      for (let productId in state.orderItems) {
        if (Number(productId) !== action.productId) {
          newState.orderItems[productId] = {...state.orderItems[productId]}
        }
      }
      newState.totalPrice = computeTotalPrice(newState)
      return newState
    default:
      return state
  }
}
