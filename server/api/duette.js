const express = require('express')
const router = express.Router();
const { Op } = require("sequelize");
const { Duette, Video } = require('../../db');

router.post('/', (req, res, next) => {
  const { id, userId, videoId } = req.body;
  Duette.create({ id, userId, videoId })
    .then(duette => res.status(201).send(duette))
    .catch(e => {
      res.status(400).send(e);
      throw new Error('error creating new duette record: ', e);
    })
});

router.get('/byUserId/:userId', (req, res, next) => {
  const { userId } = req.params;
  Duette.findAll({
    where: {
      userId,
      createdAt: {
        // past 30 days
        [Op.between]: [new Date() - 30 * 24 * 60 * 60 * 1000, new Date()]
      },
    },
    include: [
      {
        model: Video,
      }
    ],
    order: [
      ['createdAt', 'DESC']
    ],
  })
    .then(duettes => res.status(200).send(duettes))
    .catch(e => {
      res.status(400).send(e);
      throw new Error('error finding all duettes: ', e);
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
    Duette.findAll({
      order: [
        ['createdAt', 'DESC']
      ]
    })
      .then(duettes => res.status(200).send(duettes))
      .catch(e => {
        res.status(404).send(e);
        throw new Error('error finding all duettes: ', e);
      })
  }
});

module.exports = router;
