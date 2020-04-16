const express = require('express')
const router = express.Router();
const { Video } = require('../../db/models/index');

router.post('/', (req, res, next) => {
  // TODO: destructure req.body for security purposes
  // const {} = req.body;
  Video.create(req.body)
    .then(created => res.status(201).send(created))
    .catch(e => {
      console.log('error creating new video record: ', e)
      res.status(400).send(e)
    })
})

router.get('/:id?', (req, res, next) => {
  console.log('in video get!')
  const { id } = req.params
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
    console.log('in video GET else statement')
    Video.findAll()
      .then(videos => {
        // console.log('videos: ', videos)
        res.status(200).send(videos)
      })
      .catch(e => {
        console.log('error finding all videos: ', e)
        res.status(404).send(e)
      })
  }
})

module.exports = router;