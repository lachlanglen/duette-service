const Sequelize = require('sequelize');
const connection = require('../connection');

const Video = connection.define('video', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  composer: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  key: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  performer: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  thumbnailUri: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  videoUri: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  }
  // TODO: add 'createdBy' or similar
})

module.exports = Video;