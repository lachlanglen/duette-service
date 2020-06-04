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
      console.log('error creating new video record: ', e)
      res.status(400).send(e)
    })
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
        console.log("error: ", e)
        // res.send('error finding videos by search value: ', e);
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
        console.log('error finding all videos: ', e)
        res.status(404).send(e)
      })
  }
});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    composer,
    key,
    performer,
    notes,
  } = req.body;
  if (!title || !performer) {
    throw new Error('Title & performer fields must be valid to update video!')
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
          id,
        },
        returning: true,
      }
    )
      .then(updated => res.status(200).send(updated))
      .catch(e => {
        res.status(404).send(e);
        throw new Error('error updating video: ', e)
      })
  }
})

router.delete('/:videoId/:userId', (req, res, next) => {
  const { videoId, userId } = req.params;
  Video.destroy({
    where: {
      id: videoId,
      userId,
    }
  })
    .then(() => res.status(200).send('Video deleted!'))
    .catch(e => res.status(404).send('error deleting video: ', e))
})

module.exports = router; 
