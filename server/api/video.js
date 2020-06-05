const express = require('express')
const router = express.Router();
const { Video } = require('../../db');
const { Op } = require('sequelize');

router.post('/', (req, res, next) => {
  const {
    id,
    title,
    composer,
    key,
    performer,
    notes,
    userId
  } = req.body;

  if (
    title.length > 50 ||
    composer && composer.length > 20 ||
    key && key.length > 10 ||
    performer.length > 50 ||
    notes && notes.length > 250
  ) {
    res.status(400).send('Fields must adhere to maximum length requirements')
  } else {
    Video.create({
      id,
      title,
      composer,
      key,
      performer,
      notes,
      userId
    })
      .then(created => res.status(201).send(created))
      .catch(e => {
        res.status(400).send('Error creating new video record: ', e)
      })
  }
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const { val } = req.query;
  if (id) {
    Video.findOne({
      where: {
        id,
        isHidden: false,
      }
    })
      .then(video => {
        console.log('video: ', video)
        if (video) {
          res.status(200).send(video)
        } else {
          res.status(404).send('video not found!')
        }
      })
  }
});

router.get('/', (req, res, next) => {
  const { val } = req.query;
  if (val) {
    Video.findAll({
      where: {
        [Op.and]: [
          { isHidden: false },
          {
            [Op.or]: [
              { title: { [Op.iLike]: `%${val}%` } },
              { composer: { [Op.iLike]: `%${val}%` } },
              { key: { [Op.iLike]: `%${val}%` } },
              { performer: { [Op.iLike]: `%${val}%` } },
              // TODO: add Id
            ],
          }
        ]
      },
      order: [
        ['createdAt', 'DESC']
      ]
    })
      .then(videos => res.status(200).send(videos))
      .catch(e => {
        res.status(400).send('error finding videos by search value: ', e);
      })
  } else {
    Video.findAll(
      {
        where: {
          isHidden: false
        }
      },
      {
        order: [
          ['createdAt', 'DESC']
        ]
      }
    )
      .then(videos => {
        res.status(200).send(videos)
      })
      .catch(e => {
        res.status(404).send('Error finding all videos: ', e)
      })
  }
});

router.put('/:videoId/:userId', (req, res, next) => {
  const { videoId, userId } = req.params;
  const {
    title,
    composer,
    key,
    performer,
    notes,
  } = req.body;
  if (!title || !performer) {
    res.status(400).send('Title & performer fields must not be null!');
  } else if (
    title && title.length > 50 ||
    composer && composer.length > 30 ||
    key && key.length > 20 ||
    performer && performer.length > 50 ||
    notes && notes.length > 250
  ) {
    res.status(400).send('Update Video fields must adhere to maximum length requirements');
  } else {
    Video.update(
      {
        title,
        composer,
        key,
        performer,
        notes,
      },
      {
        where: {
          id: videoId,
          userId
        },
        returning: true,
      }
    )
      .then(updated => res.status(200).send(updated))
      .catch(e => {
        res.status(404).send('Error updating video record: ', e);
      })
  }
});

router.delete('/:videoId/:userId', (req, res, next) => {
  const { videoId, userId } = req.params;
  if (!videoId || !userId) {
    res.status(400).send('video id or user id not valid')
  } else {
    Video.update(
      {
        isHidden: true,
      },
      {
        where: {
          id: videoId,
          userId
        },
        returning: true,
      }
    )
      .then((updated) => res.status(200).send('Video hidden!: ', updated))
      .catch(e => res.status(404).send('error hiding video: ', e))
  }
});

module.exports = router; 
