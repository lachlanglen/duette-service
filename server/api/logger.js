const express = require('express')
const router = express.Router();

router.post('/', (req, res, next) => {
  console.log('req.body: ', req.body)
  res.status(200).send('success')
})

module.exports = router;
