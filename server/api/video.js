const express = require('express')
const router = express.Router();
const { Video } = require('../../db');

router.post('/', (req, res, next) => {
  const {
    id,
    title,
    composer,
    key,
    performer,
    userId
  } = req.body;

  Video.create({
    id,
    title,
    composer,
    key,
    performer,
    userId
  })
    .then(created => res.status(201).send(created))
    .catch(e => {
      console.log('error creating new video record: ', e)
      res.status(400).send(e)
    })
});

router.get('/:id?', (req, res, next) => {
  const { id } = req.params;
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
  } else {
    Video.findAll()
      .then(videos => {
        res.status(200).send(videos)
      })
      .catch(e => {
        console.log('error finding all videos: ', e)
        res.status(404).send(e)
      })
  }
});

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  Video.destroy({
    where: {
      id
    }
  })
    .then(() => res.status(200).send('Video deleted!'))
    .catch(e => res.status(400).send('error deleting video: ', e))
})

module.exports = router;
