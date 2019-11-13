const router = require('express').Router()
const {Order} = require('../db/models/models_index')
const {OrderToItem} = require('../db/models/models_index')
const {Product} = require('../db/models/models_index')
module.exports = router

const isCurrentUserMiddleware = (req, res, next) => {
  const currentUser = req.user
  if (currentUser) {
    // if (currentUser && currentUser.isAdmin) {
    next()
  } else {
    const error = new Error('Unauthorized')
    error.status = 401
    next(error)
  }
}

router.get(
  '/:userId/getCart',
  isCurrentUserMiddleware,
  async (req, res, next) => {
    try {
      let existingCart = await Order.findOne({
        attributes: ['id', 'orderSubmittedDate', 'totalPrice', 'userId'],
        where: {
          userId: req.params.userId,
          orderSubmittedDate: null
        }
      })
      if (existingCart) {
        const orderProducts = await Order.findAll({
          attributes: ['id', 'orderSubmittedDate', 'totalPrice', 'userId'],
          where: {id: existingCart.id},
          include: [
            {
              model: Product,
              through: {where: {orderId: existingCart.id}}
            }
          ]
        })
        res.json(orderProducts)
      } else {
        res.json([{id: -1, orderSubmittedDate: 'cart not found', products: []}])
      }
    } catch (err) {
      next(err)
    }
  }
)

//Create new order
router.post('/', isCurrentUserMiddleware, async (req, res, next) => {
  try {
    const newOrder = await Order.create({totalPrice: 0})
    // const newOrder = await Order.create({ ...req.body, totalPrice: 0 })
    if (newOrder) {
      res.json({total: newOrder.totalPrice})
    } else {
      res.status(500).send('Order creation failed.')
    }
  } catch (err) {
    next(err)
  }
})

router.put(
  '/updateOrder/:orderId/:totalPrice',
  isCurrentUserMiddleware,
  async (req, res, next) => {
    try {
      const [numOfUpdates, updatedOrder] = await Order.update(
        {totalPrice: req.params.totalPrice},
        {
          where: {id: req.params.orderId},
          returning: true
        }
      )
      if (updatedOrder) {
        res.json(updatedOrder[0].dataValues)
      } else {
        res.status(500).send('Not updated')
      }
    } catch (error) {
      next(error)
    }
  }
)

router.put('/submitOrder/:orderId', async (req, res, next) => {
  try {
    const time = Date.now()

    const [numOfUpdates, updatedOrder] = await Order.update(
      {orderSubmittedDate: time},
      {
        where: {id: req.params.orderId},
        returning: true
      }
    )
    if (updatedOrder) {
      res.json(updatedOrder[0].dataValues)
    } else {
      res.status(500).send('Not updated')
    }
  } catch (error) {
    next(error)
  }
})

router.get('/orderItems/:orderId', async (req, res, next) => {
  try {
    console.log('<<<<<<req.body: ', req.body)
    const orderItems = await OrderToItem.findAll({
      where: {
        orderId: req.params.orderId
      }
    })
    res.json(orderItems)
  } catch (error) {
    console.error(error)
    next(error)
  }
})

router.get(
  '/orderItems/:orderId',
  isCurrentUserMiddleware,
  async (req, res, next) => {
    try {
      // console.log('<<<<<<req.body: ', req.body)
      const orderItems = await OrderToItem.findAll({
        attributes: ['quantity', 'productId', 'orderId'],
        where: {
          orderId: req.params.orderId
        }
      })
      res.json(orderItems)
    } catch (error) {
      console.error(error)
      next(error)
    }
  }
)

router.put(
  '/updateOrderItems/:orderId/:productId/:quantity',
  isCurrentUserMiddleware,
  async (req, res, next) => {
    try {
      // console.log(
      //   '>>>>>>>params: ',
      //   req.params.orderId,
      //   req.params.productId,
      //   req.params.quantity
      // )
      const [numOfUpdates, updatedOrderItems] = await OrderToItem.update(
        {quantity: req.params.quantity},
        {
          where: {
            orderId: req.params.orderId,
            productId: req.params.productId
          },
          returning: true
        }
      )
      if (updatedOrderItems) {
        res.json(updatedOrderItems)
      } else {
        res.status(500).send('Not updated')
      }
    } catch (error) {
      next(error)
    }
  }
)

//Add product to order item table
//Updating order with new total price
router.post('/additem', async (req, res, next) => {
  try {
    // console.log('the body is: ', req.body)
    //gets any existing OrderItems that have the same product for this orderId
    const existingOrderToItem = await OrderToItem.findOne({
      where: {
        productId: req.body.productId,
        orderId: req.body.orderId
      }
    })
    let OrderToItemInstance = null
    let orderWasCreated = false

    //Checks to see if the product is currently on this order
    if (existingOrderToItem) {
      //Add the new quantity to the current quatity when the product is already on the order
      OrderToItemInstance = await OrderToItem.increment('quantity', {
        by: req.body.quantity,
        where: {
          orderId: req.body.orderId,
          productId: req.body.productId
        }
      })
    } else {
      //Adds the product to the order with the quantity passed in
      OrderToItemInstance = await OrderToItem.create({
        quantity: req.body.quantity,
        productId: req.body.productId,
        orderId: req.body.orderId
      })
      // OrderToItemInstance = await OrderToItem.create(req.body)
      orderWasCreated = true
    }

    //Checks to see that the OrderToItem instance was either created or its quantity
    //was increased.
    if (OrderToItemInstance) {
      //If it was we increase the total price by the new product's price
      //times the amount added
      if (!orderWasCreated) {
        OrderToItemInstance = OrderToItemInstance[0][0][0]
      }

      const newProduct = await Product.findByPk(OrderToItemInstance.productId)
      const updatedOrder = await Order.increment('totalPrice', {
        by: newProduct.price * OrderToItemInstance.quantity,
        where: {
          id: OrderToItemInstance.orderId
        }
      })
      // res.json(updatedOrder[0][0][0].totalPrice)
      res.json(OrderToItemInstance)
    } else {
      res.status(500).send('Adding product failed.')
    }
  } catch (err) {
    next(err)
  }
})

//Deletes an ordertoitem record with the given id.
//uses deleteitem path so it is not mistaken for deleting an entire cart.

router.delete(
  '/deleteitem',
  isCurrentUserMiddleware,
  async (req, res, next) => {
    try {
      const deletedItem = await OrderToItem.destroy({
        where: {
          productId: req.body.productId,
          orderId: req.body.orderId
        }
      })
      if (deletedItem) {
        res.send('Item deleted')
      } else {
        res.status(500).send('Item failed to delete.')
      }
    } catch (err) {
      next(err)
    }
  }
)
