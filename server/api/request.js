const express = require('express')
const router = express.Router();
const { Request } = require('../../db');

router.post('/', (req, res, next) => {
  const {
    title,
    composer,
    key,
    notes,
    userId,
    notifyUser,
  } = req.body;
  if (!title || !composer || !key || !userId || !notifyUser) {
    return res.status(400).send('Request must include title, composer, key and userId.')
  }
  Request.create({
    title,
    composer,
    key,
    notes,
    userId,
    notifyUser,
  })
    .then(request => res.status(201).send(request))
    .catch(e => res.status(400).send('Error creating request: ', e))
});

router.get('/', (req, res, next) => {
  Request.findAll()
    .then(requests => res.status(200).send(requests))
    .catch(e => res.status(404).send('Error finding all requests: ', e))
})

module.exports = router; 
