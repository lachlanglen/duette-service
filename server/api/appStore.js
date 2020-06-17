const express = require('express')
const router = express.Router();
const axios = require('axios');

router.post('/', (req, res, next) => {
  const { data } = req.body;
  const receiptBody = {
    'receipt-data': data,
    'password': process.env.APP_SHARED_SECRET,
  }
  axios.post('https://sandbox.itunes.apple.com/verifyReceipt', receiptBody)
    .then(result => {
      console.log('result: ', result)
      res.status(200).send(result);
    })
    .catch(e => {
      console.log('error verifying receipt: ', e);
      res.status(400).send('error verifying receipt: ', e)
    })
})

module.exports = router;
