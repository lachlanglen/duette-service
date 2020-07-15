const Sequelize = require('sequelize');
const connection = require('../connection');

const User = connection.define('user', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  isSubscribed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  hasLapsed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  oAuthId: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  isApple: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
  },
  // expires: {
  //   type: Sequelize.STRING,
  //   allowNull: true,
  // },
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
    unique: true,
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
  },
  sendEmails: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
})

module.exports = User;
