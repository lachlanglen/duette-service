const express = require('express')
const router = express.Router();
const { Request, User } = require('../../db');
const axios = require('axios');
const mailjet = require('node-mailjet')
  .connect(process.env.MAILJET_APIKEY_PUBLIC, process.env.MAILJET_APIKEY_PRIVATE);

router.post('/', (req, res, next) => {
  const {
    title,
    composer,
    key,
    notes,
    userId,
    notifyUser,
  } = req.body;
  if (!title || !composer || !key || !userId || !notifyUser) {
    return res.status(400).send('Request must include title, composer, key and userId.')
  }
  Request.create({
    title,
    composer,
    key,
    notes,
    userId,
    notifyUser,
  })
    .then(request => {
      mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: 'support@duette.app',
                Name: 'Duette Requests'
              },
              To: [
                {
                  Email: 'lachlanjglen@gmail.com',
                  Name: 'Lachlan'
                }
              ],
              Subject: 'A user has requested a Base Track!',
              HTMLPart: `<h4>Hi,</h4><div>User #${userId} has requested the following Base Track: Title - ${title}; composer - ${composer}; key - ${key}. ${notes && `They added the following notes: ${notes}`}</div><div>Thank you!</div><div>- Duette Requests</div>`,
              // CustomID: flag.dataValues.id,
            }
          ]
        })
        .then(() => res.status(201).send(request))
        .catch(e => res.status(400).send('Error sending request email: ', e))
    })
    .catch(e => res.status(400).send('Error creating request: ', e))
});

router.get('/', (req, res, next) => {
  Request.findAll()
    .then(requests => res.status(200).send(requests))
    .catch(e => res.status(404).send('Error finding all requests: ', e))
});

router.put('/markAsFulfilled/:requestId', (req, res, next) => {
  const { requestId } = req.params;
  Request.findOne({
    where: {
      id: requestId,
    }
  })
    .then(request => {
      if (request) {
        request.update({
          ...request,
          isUnfulfilled: false,
        })
          .then(updated => {
            if (request.notifyUser) {
              User.findOne({
                where: {
                  id: request.userId,
                }
              })
                .then(user => {
                  if (user) {
                    const { expoPushToken } = user;
                    const message = {
                      to: expoPushToken,
                      sound: 'default',
                      title: 'Your base track request has been fulfilled!',
                      body: 'Open the Duette app to record a Duette along with it!',
                      // channelId: 'duette',
                      // priority: 'max',
                      data: { type: 'base track' },
                      _displayInForeground: true,
                    };
                    axios.post('https://exp.host/--/api/v2/push/send', message, { headers: { 'Content-Type': 'application/json' } })
                      .then(notificationRes => {
                        if (user.sendEmails) {
                          const name = user.name.split(' ')[0];
                          mailjet
                            .post('send', { version: 'v3.1' })
                            .request({
                              Messages: [
                                {
                                  From: {
                                    Email: 'support@duette.app',
                                    Name: 'Duette Requests'
                                  },
                                  To: [
                                    {
                                      Email: user.email,
                                      Name: name,
                                    }
                                  ],
                                  Subject: 'Your base track request has been fulfilled!',
                                  HTMLPart: `<h4>Hi ${name},</h4><div>Your Base Track request was just fulfilled!</div><h4>Head over to the app to find this new base track and record a Duette along with it!</h4><div>Thanks for using Duette!</div><div>- Team Duette</div>`,
                                  // CustomID: flag.dataValues.id,
                                }
                              ]
                            })
                            .then(() => {
                              console.log('success sending email!')
                              res.status(200).send('updated!')
                            })
                            .catch(e => {
                              console.log('error sending email: ', e)
                              res.status(400).send('Error sending request fulfilled email: ', e)
                            })
                        } else {
                          res.status(200).send(updated);
                        }
                      })
                      .catch(e => res.status(400).send('Error sending request fulfilled notification: ', e))
                  } else {
                    res.status(404).send('user not found to notify about fulfilled base track!')
                  }
                })
            } else {
              // user opted out of notifications
              res.status(200).send(updated);
            }
          })
          .catch(e => res.status(400).send('error updating request as fulfilled: ', e))
      } else {
        res.status(404).send(`Request with id ${requestId} not found.`)
      }
    })
});

router.delete('/', (req, res, next) => {
  Request.destroy({
    where: {}
  })
    .then(() => res.status(200).send('destroyed!'))
    .catch(e => res.status(400).send('error destroying all requests: ', e))
})

module.exports = router; 
