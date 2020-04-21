const fs = require('fs')
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require('util');
const https = require('https');
const { s3 } = require('./awsconfig');
const exec = promisify(require('child_process').exec)

const writeFileAsync = promisify(fs.writeFile)
const ffprobeAsync = promisify(ffmpeg.ffprobe)

const key = 'f23bbf10-c0a0-4be1-94fd-aad6af5a5754.mov'
const localPath = `${__dirname}/${key}`

const remoteUrl = 'https://duette.s3.us-east-2.amazonaws.com/446b7e03-f5e0-4b30-a053-db2937ccf07a'

const writeFile = () => {
  console.log('in writeFile')
  const file = fs.createWriteStream(localPath);
  const request = https.get(remoteUrl, function (response) {
    response.pipe(file);
  });
  // await writeFileAsync(localPath, remoteUrl)
  // const metadata = await ffprobeAsync(localPath);
  // console.log('metadata: ', metadata)
}

const getMetadata = async () => {
  try {
    const metadata = await ffprobeAsync(remoteUrl);
    console.log('metadata: ', metadata)
    exec(`ffmpeg -i ${remoteUrl} test.mp4`)
  } catch (e) {
    console.log('error getting metadata: ', e)
  }
}

// const writeFile = () => {
//   s3.getObject(
//     { Bucket: 'duette', Key: key }, async (err, data) => {
//       if (err) {
//         console.log('error getting object: ,', err);
//       } else {
//         console.log('got object! ', data.body);
//         const buffer = Buffer.from(data.body)
//         try {
//           await writeFileAsync(buffer, remoteUrl)
//           console.log("file written")
//         } catch (e) {
//           console.log('error writing file: ', e)
//         }
//         // const metadata = await ffprobeAsync(localPath);
//         // console.log('metadata: ', metadata)
//       }
//     }
//   );
// }

// writeFile();

getMetadata();
