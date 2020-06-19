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

  if (email && email.length > 255) {
    res.status(400).send('Email too long')
  } else {
    // if an email is present, look for a user with the same email
    // if an email is not present, look for a user with the same facebook id
    let user;
    if (email) {
      user = await User.findOne({
        where: {
          email,
        }
      })
    } else {
      user = await User.findOne({
        where: {
          facebookId,
        }
      })
    }
    if (user) {
      console.log('user exists')
      try {
        const updatedUser = await user.update({
          name,
          facebookId,
          pictureUrl,
          pictureWidth,
          pictureHeight,
          lastLogin: lastLogin.toString(),
          email,
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
          facebookId,
          pictureUrl,
          pictureWidth,
          pictureHeight,
          lastLogin: lastLogin.toString(),
          email,
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
