const router = require('express').Router();
const s3 = require('./config');

router.post('/', (req, res, next) => {
  const { Key, Body } = req.body;
  s3.putObject({ Bucket: req.bucketName, Key, Body }, (err, data) => {
    if (err) {
      res.status(400).send(err);
      throw new Error('error in putObject: ', err);
    } else {
      res.status(200).send(data)
    }
  });
});

router.get('/getSignedUrl/:key', (req, res, next) => {
  const signedUrlExpireSeconds = 60 * 60;
  const params = { Bucket: req.bucketName, Key: req.params.key, ContentType: 'multipart/form-data', Expires: signedUrlExpireSeconds };
  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      res.status(400).send(err);
      throw new Error('error getting signedUrl: ', err);
    }
    res.status(200).send(url)
  });
});

router.get('/:Key', (req, res, next) => {
  const { Key } = req.params;
  s3.getObject({ Bucket: req.bucketName, Key }, (error, data) => {
    if (error) {
      res.status(400).send(error);
      throw new Error('error getting object from AWS: ', error)
    }
    res.status(200).send(data.Body);
  });
});

router.delete('/:Key', (req, res, next) => {
  const { Key } = req.params;
  s3.deleteObject({ Bucket: req.bucketName, Key }, (err, data) => {
    if (err) {
      res.status(400).send(err);
      throw new Error('error deleting object: ', err);
    } else {
      res.status(200).send(`Object deleted: Key ${Key}`)
    }
  });
});

module.exports = router;
