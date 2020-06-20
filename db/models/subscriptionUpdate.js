const Sequelize = require('sequelize');
const connection = require('../connection');

const SubscriptionUpdate = connection.define('subscriptionUpdate', {
  json: {
    type: Sequelize.JSONB,
    allowNull: false,
  },
})

module.exports = SubscriptionUpdate;
