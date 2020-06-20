const express = require('express')
const router = express.Router();
const axios = require('axios');
const { SubscriptionUpdate } = require('../../db');

router.post('/', (req, res, next) => {
  const { data } = req.body;
  const receiptBody = {
    'receipt-data': data,
    'password': process.env.APP_SHARED_SECRET,
  }
  axios.post('https://sandbox.itunes.apple.com/verifyReceipt', receiptBody)
    .then(result => {
      // console.log('result: ', result.data);
      // console.log('latest_receipt_info: ', JSON.parse(JSON.stringify(result.data.latest_receipt_info)));
      res.status(200).send(JSON.parse(JSON.stringify(result.data.latest_receipt_info)));
    })
    .catch(e => {
      console.log('error verifying receipt: ', e);
      res.status(400).send('error verifying receipt: ', e)
    })
});

router.post('/subscriptionUpdate', (req, res, next) => {
  console.log('req.body: ', req.body)
  const { object, type } = req.body;
  SubscriptionUpdate.create({ object, type })
    .then(update => {
      console.log('successfully added update: ', update);
      res.status(200).send('added update!');
    })
    .catch(e => {
      console.log('error adding updaate: ', e);
      res.status(400).send(e)
    })
});

router.get('/subscriptionUpdate', (req, res, next) => {
  SubscriptionUpdate.findAll()
    .then(updates => res.status(200).send(updates))
    .catch(e => {
      console.log('error finding all updates: ', e);
      res.status(400).send(e)
    })
});

module.exports = router;
