const express = require('express')
const router = express.Router();
const { User } = require('../../db');

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
      .then(users => res.status(200).send(users))
      .catch(e => res.status(404).send('Could not GET all users: ', e))
  }
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
  console.log('req.body: ', req.body)
  const {
    name,
    facebookId,
    pictureUrl,
    pictureWidth,
    pictureHeight,
    lastLogin,
    email
  } = req.body;

  if (email.length > 255) {
    res.status(400).send('Email too long')
  } else {
    User.findOne({
      where: {
        facebookId,
      }
    })
      .then(user => {
        // user already exists
        // update user with lastLogin and other info to ensure it's up to date
        console.log('user exists')
        if (user) {
          user.update({
            name,
            facebookId,
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
          console.log("user doesn't exist")
          User.create({
            name,
            facebookId,
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
  }
});

router.put('/:userId', (req, res, next) => {
  const { userId } = req.params;
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
            .then(updated => res.status(200).send(updated))
            .catch(e => res.status(400).send('error updating user: ', e))
        } else {
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
