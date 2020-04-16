const AWS = require('aws-sdk');
const bucketName = 'duette';
const bucketRegion = 'us-east-2';
const identityPoolId = 'us-east-2:3e1253a3-a90c-43af-ba82-0ed847f70b39';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId
  })
});

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: bucketName }
});

module.exports = {
  s3
}