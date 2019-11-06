const Sequelize = require('sequelize')
const db = require('../db')
const {User} = require('./models_index')

const Order = db.define('order', {
  orderSubmittedDate: {
    type: Sequelize.DATE
  }
})

//Creates FK to user table.

module.exports = Order
