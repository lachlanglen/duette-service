const Sequelize = require('sequelize');
const connection = require('../connection');

const Flag = connection.define('flag', {
  videoId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  flaggingUserId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  flaggedUserId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  hasBeenReviewed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  violatesTerms: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
})

module.exports = Flag;
