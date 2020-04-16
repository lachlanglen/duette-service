const express = require('express')
const router = express.Router();
const { User } = require('../../db/models/index');

router.post('/', (req, res, next) => {
  console.log('req.body in user GET: ', req.body)
  const { facebookToken, displayName, photoURL } = req.body;

  User.findOne({
    where: {
      facebookToken
    }
  })
    .then(user => {
      if (user) {
        console.log('user found!')
        res.status(200).send(user)
      } else {
        // create user
        User.create({ facebookToken, displayName, photoURL })
          .then(newUser => res.status(201).send(newUser))
          .catch(e => {
            console.log('error creating new user: ', e);
            res.status(400).send('error creating new user: ', e)
          })
      }
    })
})

module.exports = router;