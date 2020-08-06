const Sequelize = require('sequelize');
const connection = require('../connection');

const Request = connection.define('request', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  isUnfulfilled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  notifyUser: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  title: {
    type: Sequelize.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  composer: {
    type: Sequelize.STRING(30),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  key: {
    type: Sequelize.STRING(30),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true,
    validate: {
      len: [0, 250],
    }
  },
})

module.exports = Request;
