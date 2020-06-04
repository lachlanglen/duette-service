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
        id
      }
    })
      .then(video => {
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
        [Op.or]: [
          { title: { [Op.iLike]: `%${val}%` } },
          { composer: { [Op.iLike]: `%${val}%` } },
          { key: { [Op.iLike]: `%${val}%` } },
          { performer: { [Op.iLike]: `%${val}%` } },
          // TODO: add Id
        ],
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
    Video.findAll({
      order: [
        ['createdAt', 'DESC']
      ]
    })
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
  console.log('req.params: ', req.params);
  console.log('req.body: ', req.body)
  if (!title || !performer) {
    res.status(400).send('Title & performer fields must not be null!');
  } else if (
    title && title.length > 50 ||
    composer && composer.length > 20 ||
    key && key.length > 10 ||
    performer && performer.length > 50 ||
    notes && notes.length > 250
  ) {
    console.log('an error in here...')
    console.log('title && title.length > 50: ', title && title.length > 50)
    console.log('composer && composer.length > 20: ', composer && composer.length > 20);
    console.log('key && key.length > 10: ', key && key.length > 10);
    console.log('performer && performer.length > 50: ', performer && performer.length > 50);
    console.log('notes && notes.length > 250: ', notes && notes.length > 250)
    res.status(400).send('Update Video fields must adhere to maximum length requirements');
  } else {
    console.log('passed the test!')
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
    Video.destroy({
      where: {
        id: videoId,
        userId
      }
    })
      .then(() => res.status(200).send('Video deleted!'))
      .catch(e => res.status(404).send('error deleting video: ', e))
  }
});

module.exports = router;
