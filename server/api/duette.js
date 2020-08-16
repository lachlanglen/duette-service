const express = require('express')
const router = express.Router();
const { Op } = require("sequelize");
const { Duette, Video } = require('../../db');

router.post('/', (req, res, next) => {
  const { id, userId, videoId, shouldShare, baseTrackUserId } = req.body;
  Duette.create({ id, userId, videoId, shouldShare, baseTrackUserId })
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
      [Op.and]: [
        {
          [Op.or]: [
            {
              userId,
            },
            {
              [Op.and]: [
                {
                  shouldShare: true,
                },
                {
                  baseTrackUserId: userId,
                },
              ],
            },
          ]
        },
        {
          createdAt: {
            // past 30 days
            [Op.between]: [new Date() - 30 * 24 * 60 * 60 * 1000, new Date()],
          },
        },
      ],
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

router.put('/:duetteId', (req, res, next) => {
  const { duetteId } = req.params;
  Duette.findOne({
    where: {
      id: duetteId,
    }
  })
    .then(duette => {
      if (duette) {
        duette.update({
          ...duette,
          ...req.body,
        })
          .then(updated => res.staatus(200).send('successfully updated: ', updated))
          .catch(e => res.status(400).send('error updating duette: ', e))
      } else {
        res.status(404).send('Duette not found to update')
      }
    })
});

module.exports = router;
