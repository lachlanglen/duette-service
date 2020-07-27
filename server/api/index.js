const express = require('express');

const router = express.Router();

router.use(express.json());

//add additional routes here

router.use('/ffmpeg', require('./ffmpeg'));
router.use('/video', require('./video'));
router.use('/aws', require('./aws/router'));
router.use('/duette', require('./duette'));
router.use('/user', require('./user'));
router.use('/appStore', require('./appStore'));
router.use('/logger', require('./logger'));
router.use('/flag', require('./flag'));
router.use('/connection', require('./connection'));

//error handling
router.use((req, res, next) => {
  const err = new Error(`Invalid API path: ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

module.exports = router;
