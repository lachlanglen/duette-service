const Sequelize = require('sequelize');
const connection = require('../connection');

const SubscriptionUpdate = connection.define('subscriptionUpdate', {
  object: {
    type: Sequelize.JSONB,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  }
})

module.exports = SubscriptionUpdate;
