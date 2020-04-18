const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const chalk = require('chalk');

// const cookieParser = require('cookie-parser');
const APIRouter = require('./api');

const server = express();

const dotenv = require('dotenv')

dotenv.config();

// console.log('in index.js - process.env.AWS_BUCKET_NAME: ', process.env.AWS_BUCKET_NAME)

//middleware here
// server.use(express.json());

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Methods", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

server.use(bodyParser.json({ limit: '100mb', extended: true }))
server.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

// server.use(express.static(path.join(__dirname, '../public')));
// server.use(cookieParser());

// logger
if (process.env.NODE_ENV !== 'production') {
  server.use(require('morgan')('dev'));
}

// FIXME: maybe the below is insecure?
server.use((req, res, next) => {
  req.bucketName = process.env.AWS_BUCKET_NAME;
  req.bucketRegion = process.env.AWS_BUCKET_REGION;
  req.identityPoolId = process.env.AWS_IDENTITY_POOL_ID;
  next();
})

//check for cookie

//routing here
server.use('/api', APIRouter);

//main route to serve index.html
// server.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/index.html'));
// });

//error handling
server.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(chalk.red('Error in server request'));
    console.error(chalk.white(err.stack));
  }
  res.status(err.status || 500).send(err.message || 'Internal server error');
});

module.exports = server;
