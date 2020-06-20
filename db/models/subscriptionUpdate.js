const Sequelize = require('sequelize');
const connection = require('../connection');

const SubscriptionUpdate = connection.define('subscriptionUpdate', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  json: {
    type: Sequelize.JSONB,
    allowNull: false,
  },
})

module.exports = SubscriptionUpdate;
