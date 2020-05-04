const mailjet = require('node-mailjet')
  .connect(process.env.MAILJET_APIKEY_PUBLIC, process.env.MAILJET_APIKEY_PRIVATE)
const request = mailjet
  .post('send', { version: 'v3.1' })
  .request({
    Messages: [
      {
        From: {
          Email: 'support@duette.app',
          Name: 'Duette'
        },
        To: [
          {
            Email: 'lachlanjglen@gmail.com',
            Name: 'Lachlan'
          }
        ],
        Subject: 'Your video is ready!',
        // TextPart: 'My first Mailjet email',
        HTMLPart: `<h3>Dear Lachlan, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!`,
        CustomID: 'AppGettingStartedTest'
      }
    ]
  })
request
  .then((result) => {
    console.log(result.body)
  })
  .catch((err) => {
    console.log(err.statusCode)
  })