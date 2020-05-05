const express = require('express');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser')
const chalk = require('chalk');
const APIRouter = require('./api');

const server = express();

const dotenv = require('dotenv')

dotenv.config();

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

server.use(bodyParser.json({ limit: '100mb', extended: true }))
server.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

if (process.env.NODE_ENV !== 'production') {
  server.use(require('morgan')('dev'));
}

server.use('/', (req, res, next) => {
  req.bucketName = process.env.AWS_BUCKET_NAME;
  next();
})

server.use('/api', APIRouter);

server.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(chalk.red('Error in server request'));
    console.error(chalk.white(err.stack));
  }
  res.status(err.status || 500).send(err.message || 'Internal server error');
});

module.exports = {
  server
};

