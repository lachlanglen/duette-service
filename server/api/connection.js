const express = require('express')
const router = express.Router();
const { Connection } = require('../../db'); // TODO: fix this (Connection is defined as an alias)

router.get('/', (req, res, next) => {
  Connection.findAll()
    .then(connections => res.status(200).send(connections))
    .catch(e => res.status(400).send('Error finding all connections: ', e))
});

router.delete('/:userId/:blockedId', (req, res, next) => {
  const { userId, blockedId } = req.params;
  Connection.destroy({
    where: {
      userId,
      blockedId,
    }
  })
    .then(() => res.status(200).send('Connection deleted!'))
    .catch(e => res.status(400).send('error deleting connection: ', e))
})

module.exports = router; 
