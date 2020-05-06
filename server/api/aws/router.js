const router = require('express').Router();
const s3 = require('./config');

router.post('/', (req, res, next) => {
  const { Key, Body } = req.body;
  s3.putObject({ Bucket: req.bucketName, Key, Body }, (err, data) => {
    if (err) {
      console.log('error: ', err)
      res.status(400).send(err)
    } else {
      res.status(200).send(data)
    }
  });
});

router.get('/getSignedUrl/:key', (req, res, next) => {
  const signedUrlExpireSeconds = 60 * 60;
  console.log('req.bucketName: ', req.bucketName)
  const params = { Bucket: req.bucketName, Key: req.params.key, ContentType: 'multipart/form-data', Expires: signedUrlExpireSeconds };
  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      console.log('error getting signed url: ', err);
      res.status(400).send(err);
    }
    res.status(200).send(url)
  });
});

router.get('/:Key', (req, res, next) => {
  const { Key } = req.params;
  s3.getObject({ Bucket: req.bucketName, Key }, (error, data) => {
    if (error) {
      console.log('error getting object from AWS: ', error)
      return res.status(400).send(error)
    }
    res.status(200).send(data.Body);
  });
});

router.delete('/:Key', (req, res, next) => {
  const { Key } = req.params;
  s3.deleteObject({ Bucket: req.bucketName, Key }, (err, data) => {
    if (err) {
      console.log('error deleting object: ', err);
      res.status(400).send(err);
    } else {
      res.status(200).send(`Object deleted: Key ${Key}`)
    }
  });
});

module.exports = router;
