const express = require('express')
const router = express.Router();
const { Video, User } = require('../../db');
const { Op } = require('sequelize');

router.post('/', (req, res, next) => {
  const {
    id,
    title,
    composer,
    key,
    performer,
    notes,
    userId,
    isPrivate,
    userReference,
  } = req.body;

  if (
    title.length > 50 ||
    composer && composer.length > 30 ||
    key && key.length > 20 ||
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
      userId,
      isPrivate,
      userReference,
    })
      .then(created => res.status(201).send(created))
      .catch(e => {
        res.status(400).send('Error creating new video record: ', e)
      })
  }
});

router.get('byId/:id', (req, res, next) => {
  console.log('in GET byId')
  const { id } = req.params;
  const { val } = req.query;
  if (id) {
    Video.findOne({
      where: {
        id,
        isHidden: false,
      },
      include: [
        {
          model: User,
        }
      ],
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

router.get('/generateRandomId', (req, res, next) => {
  let randomId;
  const generateUniqueId = async () => {
    randomId = Math.floor(100000 + Math.random() * 900000);
    try {
      const exists = await Video.findOne({
        where: {
          userReference: randomId,
        }
      });
      if (exists) {
        generateUniqueId();
      }
      else {
        res.status(200).send({ randomId });
      }
    } catch (e) {
      res.status(400).send('error generating randomId: ', e)
    }
  };
  generateUniqueId();
});

router.get('/withUserId/:userId', (req, res, next) => {
  let { val } = req.query;
  const { userId } = req.params;
  // console.log('userId: ', userId);
  if (!userId) {
    res.status(400).send('video GET request must include userId in params!')
  }
  const blocked = [];
  User.findOne({
    where: {
      id: userId,
    }
  })
    .then(user => {
      if (user) {
        user.getBlocked()
          .then(blockedUsers => blockedUsers.forEach(blockedUser => blocked.push(blockedUser.id)))
          .then(() => {
            // console.log('blocked: ', blocked);
            if (val) {
              const numberVal = Number(val);
              if (!numberVal) {
                // user is searching by title etc.
                Video.findAll({
                  where: {
                    [Op.and]: [
                      {
                        isHidden: false,
                      },
                      // {
                      //   // TODO: change this - user has to be able to search for their own Base Tracks by title etc, even if they're private.
                      //   // IF userId passed to route === video's userId, ignore isPrivate field
                      //   isPrivate: false,
                      // },
                      {
                        userId: {
                          [Op.notIn]: blocked,
                        }
                      },
                      {
                        [Op.or]: [
                          { title: { [Op.iLike]: `%${val}%` } },
                          { composer: { [Op.iLike]: `%${val}%` } },
                          { key: { [Op.iLike]: `%${val}%` } },
                          { performer: { [Op.iLike]: `%${val}%` } },
                        ],
                      }
                    ]
                  },
                  order: [
                    ['createdAt', 'DESC']
                  ]
                })
                  .then(videos => {
                    // filter out videos where isPrivate is true and current userId !== vid.userId
                    // const filtered = videos.filter(vid => vid.isPrivate && vid.userId === userId)
                    const filterFunc = el => {
                      if (el.isPrivate && el.userId !== userId) return true;
                      else return false;
                    };
                    const filtered = videos.filter(vid => !filterFunc(vid));
                    res.status(200).send(filtered)
                  })
                  .catch(e => {
                    console.log('error: ', e)
                    res.status(400).send('error finding videos by search value: ', e);
                  })
              } else {
                // user is searching by ID
                Video.findAll({
                  where: {
                    [Op.and]: [
                      {
                        isHidden: false,
                      },
                      // {
                      //   userId: {
                      //     [Op.notIn]: blocked,
                      //   }
                      // },
                      {
                        // userReference: { [Op.eq]: numberVal }
                        [Op.or]: [
                          { title: { [Op.iLike]: `%${val}%` } },
                          { composer: { [Op.iLike]: `%${val}%` } },
                          { key: { [Op.iLike]: `%${val}%` } },
                          { performer: { [Op.iLike]: `%${val}%` } },
                          { userReference: { [Op.eq]: numberVal } },
                        ],
                      }
                    ]
                  },
                  order: [
                    ['createdAt', 'DESC']
                  ]
                })
                  .then(videos => {
                    res.status(200).send(videos)
                  })
                  .catch(e => {
                    console.log('error: ', e)
                    res.status(400).send('error finding videos by ID: ', e);
                  })
              }
            } else {
              Video.findAll(
                {
                  where: {
                    [Op.and]: [
                      {
                        isHidden: false
                      },
                      {
                        userId: {
                          [Op.notIn]: blocked,
                        }
                      }
                    ]
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
          })
          .catch(e => res.status(400).send(`error getting blocked users for userId ${userId}:`, e))
      } else {
        res.status(400).send('Video GET request must include userId in body!')
      }
    })
});

// remove below route eventually (to be deprecated)
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const { val } = req.query;
  if (id) {
    Video.findOne({
      where: {
        id,
        isHidden: false,
      },
      include: [
        {
          model: User,
        }
      ],
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

// remove below route eventually (to be deprecated)
router.get('/', (req, res, next) => {
  const { val } = req.query;
  if (val) {
    Video.findAll({
      where: {
        [Op.and]: [
          {
            isHidden: false,
          },
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
      .then(videos => {
        res.status(200).send(videos)
      })
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

router.put('/increment/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  Video.findOne({
    where: {
      id: videoId,
    }
  })
    .then(video => {
      if (video) {
        video.update({
          numUses: video.numUses + 1,
        },
          {
            returning: true,
          })
          .then(updated => {
            // console.log('updated: ', updated)
            res.status(200).send(updated)
          })
          .catch(e => {
            // console.log('error line 180: ', e)
            res.status(400).send(`error incrementing video record with id: ${videoId}`, e)
          })
      } else {
        // console.log('video not found')
        res.status(400).send(`video with id ${videoId} not found`)
      }
    })
});

router.put('/:videoId/:userId', (req, res, next) => {
  const { videoId, userId } = req.params;
  const {
    title,
    composer,
    key,
    performer,
    notes,
    numUses,
    isPrivate,
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
        isPrivate,
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
      .then(() => res.status(200).send('Video hidden!'))
      .catch(e => res.status(404).send('error hiding video: ', e))
  }
});

module.exports = router; 
