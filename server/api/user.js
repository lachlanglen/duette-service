const express = require('express')
const router = express.Router();
const { User } = require('../../db');

// User.findOne({
//   where: {
//     name: 'Lachlan Glen'
//   }
// })
//   .then(found => {
//     if (found) {
//       // console.log('fsound: ', found)
//       User.findOne({
//         where: {
//           name: 'Leanne Glen'
//         }
//       })
//         .then(found2 => {
//           if (found2) {
//             found.addBlocked(found2)
//               .then(r => {
//                 console.log('added blocked! ', r)
//                 found.getBlocked()
//                   .then(blocked => console.log("Lachlan's blocked list: ", blocked))
//                   .catch(e => console.log("Error getting Lachlan's blocked list: ", e))
//               })
//               .catch(e => console.log('error adding blocked: ', e))
//           } else {
//             console.log('Leanne not found')
//           }
//         })
//     } else {
//       console.log('Lachlan not found')
//     }
//   })

router.post('/block', (req, res, next) => {
  const { blockingUser, userToBlock } = req.body;
  User.findOne({
    where: {
      id: blockingUser,
    }
  })
    .then(found => {
      if (found) {
        User.findOne({
          where: {
            id: userToBlock,
          }
        })
          .then(toBlock => {
            if (toBlock) {
              found.addBlocked(toBlock)
                .then(() => {
                  console.log('added blocked!')
                  res.status(200).send('successfully blocked user!')
                })
                .catch(e => res.status(400).send('error adding blocked: ', e))
            } else {
              console.log(`User to block with id ${userToBlock} not found`)
              res.status(404).send(`User to block with id ${userToBlock} not found`)
            }
          })
      } else {
        console.log(`Blocking user with id ${blockingUser} not found`)
        res.status(404).send(`Blocking user with id ${blockingUser} not found`)
      }
    })
})

router.get('/:id?', (req, res, next) => {
  const { id } = req.params;
  if (id) {
    User.findOne({
      where: {
        id,
      }
    })
      .then(user => {
        if (user) {
          res.status(200).send(user);
        } else {
          res.status(404).send(`user not found with id #${id}`)
        }
      })
  } else {
    User.findAll()
      .then(users => res.send(users))
      .catch(e => res.send('Could not GET all users: ', e))
  }
});

router.get('/oAuthId/:oAuthId', async (req, res, next) => {
  const { oAuthId } = req.params;
  User.findOne({
    where: {
      oAuthId,
    }
  })
    .then(user => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send(`user not found with oAuthId ${oAuthId}`)
      }
    })
});

router.post('/', async (req, res, next) => {
  console.log('req.body: ', req.body)
  const {
    name,
    oAuthId,
    email,
    lastLogin,
    isApple,
  } = req.body;

  if (email && email.length > 255) {
    res.status(400).send('Email too long')
  } else {
    // if an email is present, look for a user with the same email
    // if an email is not present, look for a user with the same facebook id
    let user;
    if (email && !isApple) {
      user = await User.findOne({
        where: {
          email,
        }
      })
    } else {
      user = await User.findOne({
        where: {
          oAuthId,
        }
      })
    }
    if (user) {
      console.log('user exists')
      try {
        const updatedUser = await user.update({
          lastLogin: lastLogin.toString(),
        });
        res.status(200).send(updatedUser);
      } catch (e) {
        console.log('error updating user: ', e);
        res.status(400).send(e);
      }
    } else {
      // user doesn't exist
      // create user
      console.log("user doesn't exist")
      try {
        const newUser = await User.create({
          name,
          oAuthId,
          lastLogin: lastLogin.toString(),
          email,
          isApple,
        })
        res.status(201).send(newUser)
      } catch (e) {
        console.log('error creating new user: ', e);
        res.status(400).send(e)
      }
    }
  }
});

router.put('/:userId', (req, res, next) => {
  const { userId } = req.params;
  // console.log('userId: ', userId);
  // console.log('req.body: ', req.body);
  if (req.body.email && req.body.email.length > 255) {
    res.status(400).send('Email too long')
  } else {
    User.findOne({
      where: {
        id: userId,
      }
    })
      .then(user => {
        if (user) {
          user.update({
            ...user,
            ...req.body,
          })
            .then(updated => {
              res.status(200).send(updated)
            })
            .catch(e => {
              console.log('error updating user: ', e)
              res.status(400).send('error updating user: ', e)
            })
        } else {
          console.log('could not find user to update')
          res.status(404).send(`User #${userId} not found.`)
        }
      })
  }
});

router.delete('/:userId', (req, res, next) => {
  const { userId } = req.params;
  User.destroy({
    where: {
      id: userId,
    }
  })
    .then(() => res.status(200).send('User deleted!'))
    .catch(e => res.status(404).send('error deleting user: ', e))
})

module.exports = router;
