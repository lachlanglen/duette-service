const Sequelize = require('sequelize');
const connection = require('../connection');

const User = connection.define('user', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  hashedFacebookId: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  expires: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  hashedEmail: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  pictureUrl: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  pictureWidth: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  pictureHeight: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  lastLogin: {
    type: Sequelize.STRING,
    allowNull: false,
  }
})

module.exports = User;
