const express = require('express')
const router = express.Router();
const { Duette } = require('../../db');

router.post('/', (req, res, next) => {
  const { id, userId, videoId } = req.body;
  Duette.create({ id, userId, videoId })
    .then(duette => res.status(201).send(duette))
    .catch(e => {
      console.log('error creating new duette record: ', e)
      res.status(400).send(e)
    })
});

router.get('/byUserId/:userId', (req, res, next) => {
  const { userId } = req.params;
  Duette.findOne({
    where: {
      userId
    }
  })
    .then(duette => {
      if (duette) {
        res.status(200).send(duette)
      } else {
        res.status(404).send(`Video not found with userId ${userId}!`)
      }
    })
});

router.get('/:id?', (req, res, next) => {
  const { id } = req.params;
  if (id) {
    Duette.findOne({
      where: {
        id
      }
    })
      .then(duette => {
        if (duette) {
          res.status(200).send(duette)
        } else {
          res.status(404).send('video not found!')
        }
      })
  } else {
    console.log('in duette GET else statement')
    Duette.findAll()
      .then(duettes => res.status(200).send(duettes))
      .catch(e => {
        console.log('error finding all duettes: ', e)
        res.status(404).send(e)
      })
  }
});

module.exports = router;
