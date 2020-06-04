const Sequelize = require('sequelize');
const connection = require('../connection');

const Video = connection.define('video', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  title: {
    type: Sequelize.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  composer: {
    type: Sequelize.STRING(20),
    allowNull: true,
    validate: {
      notEmpty: true,
    },
  },
  key: {
    type: Sequelize.STRING(10),
    allowNull: true,
    validate: {
      notEmpty: true,
    },
  },
  performer: {
    type: Sequelize.STRING(50),
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
  }
})

module.exports = Video;
