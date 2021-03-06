const Sequelize = require('sequelize')
const db = require('../db')
const {User} = require('./models_index')

const Order = db.define('order', {
  orderSubmittedDate: {
    type: Sequelize.DATE
  },
  totalPrice: {
    type: Sequelize.INTEGER,
    default: 0,
    allowNull: false,
    validate: {
      min: 0
    }
  }
})

//Creates FK to user table.

module.exports = Order
