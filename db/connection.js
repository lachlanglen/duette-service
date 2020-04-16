const Sequelize = require('sequelize');
const PORT = process.env.PORT || 5432;
const localDB = `postgres://localhost:${PORT}/duette`;
// const testDB = `postgres://localhost:${PORT}/duette_test`
let dbString;

if (process.env.NODE_ENV === 'production') {
  dbString = process.env.DATABASE_URL
} else {
  dbString = localDB
}

const connection = new Sequelize(dbString, { logging: false })

module.exports = connection;
