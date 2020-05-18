const express = require('express')
const router = express.Router();
const { User } = require('../../db');

router.get('/', (req, res, next) => {
  User.findAll()
    .then(users => res.status(200).send(users))
    .catch(e => res.status(404).send('Could not GET all users: ', e))
});

router.get('/facebookId/:facebookId', async (req, res, next) => {
  const { facebookId } = req.params;
  User.findOne({
    where: {
      facebookId,
    }
  })
    .then(user => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send(`user not found with facebookId ${facebookId}`)
      }
    })
});

router.post('/', async (req, res, next) => {
  const {
    name,
    facebookId,
    expires,
    pictureUrl,
    pictureWidth,
    pictureHeight,
    lastLogin,
    email
  } = req.body;

  User.findOne({
    where: {
      facebookId,
    }
  })
    .then(user => {
      // user already exists
      // update user with lastLogin and other info to ensure it's up to date
      if (user) {
        user.update({
          name,
          facebookId,
          expires: expires.toString(),
          pictureUrl,
          pictureWidth,
          pictureHeight,
          lastLogin: lastLogin.toString(),
          email,
        })
          .then(updatedUser => {
            res.status(200).send(updatedUser);
          })
          .catch(e => {
            console.log('error updating user: ', e);
            res.status(400).send(e);
          })
      } else {
        // user doesn't exist
        // create user
        User.create({
          name,
          facebookId,
          expires: expires.toString(),
          pictureUrl,
          pictureWidth,
          pictureHeight,
          lastLogin: lastLogin.toString(),
          email,
        })
          .then(newUser => res.status(201).send(newUser))
          .catch(e => {
            console.log('error creating new user: ', e);
            res.status(400).send(e)
          })
      }
    })
});

module.exports = router;
