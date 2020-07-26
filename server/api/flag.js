const express = require('express')
const router = express.Router();
const { Flag } = require('../../db');

router.post('/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  const { flaggingUserId, flaggedUserId } = req.body;
  if (!flaggingUserId || !flaggedUserId) {
    return res.status(400).send('Request must include flaggingUserId and flaggedUserId.')
  }
  Flag.create({
    videoId,
    flaggingUserId,
    flaggedUserId,
  })
    .then(flag => {
      // do something with new flag
      console.log('flag created! ', flag);
      res.status(201).send(flag);
    })
    .catch(e => {
      console.log('Error creating new flag: ', e);
      res.status(400).send('Error creating new flag: ', e)
    })
});

module.exports = router; 
