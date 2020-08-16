const Sequelize = require('sequelize');
const connection = require('../connection');

const Duette = connection.define('duette', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  shouldShare: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  baseTrackUserId: {
    type: Sequelize.UUID,
    allowNull: true,
  }
})

module.exports = Duette;
