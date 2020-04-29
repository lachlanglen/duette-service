const express = require('express')
const router = express.Router();
const { User } = require('../../db/models/index');
const { hasher } = require('../../utils');
const bcrypt = require('bcrypt');

const saltRounds = 10;

router.get('/facebookId/:facebookId', async (req, res, next) => {
  const { facebookId } = req.params;
  const hashedId = await bcrypt.hash(facebookId, saltRounds);
  User.findOne({
    where: {
      hashedFacebookId: hashedId
    }
  })
    .then(user => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send(`user not found with facebookId ${facebookId}`)
      }
    })
})

router.post('/', async (req, res, next) => {
  console.log('req.body in user GET: ', req.body)
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

  const hashedId = await bcrypt.hash(facebookId, saltRounds);
  const hashedEmail = await bcrypt.hash(email, saltRounds);

  console.log('hashedId: ', hashedId);
  console.log('hashedEmail: ', hashedEmail);

  User.findOne({
    where: {
      hashedFacebookId: hashedId,
    }
  })
    .then(user => {
      // user already exists; update user with lastLogin and other info to ensure it's up to date
      if (user) {
        console.log('user found!')
        user.update({
          name,
          hashedFacebookId: hashedId,
          expires: expires.toString(),
          pictureUrl,
          pictureWidth,
          pictureHeight,
          lastLogin: lastLogin.toString(),
          hashedEmail,
        })
          .then(updatedUser => {
            console.log('updatedUser: ', updatedUser);
            res.status(200).send(updatedUser);
          })
          .catch(e => {
            console.log('error updating user: ', e);
            res.status(400).send(e);
          })
        res.status(200).send(user)
      } else {
        // user doesn't exist
        // create user
        console.log('in user ELSE block')
        User.create({
          name,
          hashedFacebookId: hashedId,
          expires: expires.toString(),
          pictureUrl,
          pictureWidth,
          pictureHeight,
          lastLogin: lastLogin.toString(),
          hashedEmail,
        })
          .then(newUser => res.status(201).send(newUser))
          .catch(e => {
            console.log('error creating new user: ', e);
            res.status(400).send(e)
          })
      }
    })
})

module.exports = router;
