const express = require('express')
const router = express.Router();

router.post('/', (req, res, next) => {
  const { data } = req.body;
  console.log('data: ', data)
  res.status(200).send(data)
})

module.exports = router;
