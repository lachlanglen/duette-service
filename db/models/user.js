const Sequelize = require('sequelize');
const connection = require('../connection');

const User = connection.define('user', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  facebookId: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
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
  email: {
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
