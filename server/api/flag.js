const express = require('express')
const router = express.Router();
const { Flag } = require('../../db');

router.post('/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  const { flaggingUserId, flaggedUserId } = req.body;
  // console.log('videoId: ', videoId, 'flaggingUserId: ', flaggingUserId, 'flaggedUserId: ', flaggedUserId)
  if (!flaggingUserId || !flaggedUserId) {
    return res.status(400).send('Request must include flaggingUserId and flaggedUserId.')
  }
  Flag.create({
    videoId,
    flaggingUserId,
    flaggedUserId,
  })
    .then(flag => {
      // console.log('flag created! ', flag);
      res.status(201).send(flag);
    })
    .catch(e => {
      // console.log('Error creating new flag: ', e);
      res.status(400).send('Error creating new flag: ', e)
    })
});

router.get('/', (req, res, next) => {
  Flag.findAll()
    .then(flags => res.status(200).send(flags))
    .catch(e => res.status(400).send('Error finding all flags: ', e))
});

module.exports = router; 
