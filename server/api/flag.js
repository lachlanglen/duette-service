const express = require('express')
const router = express.Router();
const { Flag } = require('../../db');
const mailjet = require('node-mailjet')
  .connect(process.env.MAILJET_APIKEY_PUBLIC, process.env.MAILJET_APIKEY_PRIVATE)

router.post('/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  const { flaggingUserId, flaggedUserId } = req.body;
  // console.log('videoId: ', videoId, 'flaggingUserId: ', flaggingUserId, 'flaggedUserId: ', flaggedUserId)
  if (!flaggingUserId || !flaggedUserId) {
    return res.status(400).send('Request must include flaggingUserId and flaggedUserId.')
  }
  Flag.create({
    videoId,
    flaggingUserId,
    flaggedUserId,
  })
    .then(flag => {
      console.log('flag created! ', flag);
      mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: 'support@duette.app',
                Name: 'Duette Admin'
              },
              To: [
                {
                  Email: 'lachlanjglen@gmail.com',
                  Name: 'Duette Admin'
                }
              ],
              Subject: 'A video has been flagged for inappropriate content',
              HTMLPart: `<h4>Hi,</h4><div>User #${flaggingUserId} has flagged user #${flaggedUserId}'s video with ID #${videoId} for inappropriate content. Please review within 24 hours.</div><div>Thank you!</div><div>- Duette Admin</div>`,
              CustomID: flag.dataValues.id,
            }
          ]
        })
        .then(res => {
          console.log('success sending email! response: ', res.body);
          res.status(200).send(flag)
        })
        .catch(e => {
          console.log('error sending email: ', e);
          res.status(400).send('error sending email: ', e)
        })
    })
    .catch(e => {
      // console.log('Error creating new flag: ', e);
      res.status(400).send('Error creating new flag: ', e)
    })
});

router.get('/', (req, res, next) => {
  Flag.findAll()
    .then(flags => res.status(200).send(flags))
    .catch(e => res.status(400).send('Error finding all flags: ', e))
});

module.exports = router; 
