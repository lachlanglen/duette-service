/* eslint-disable complexity */
/* eslint-disable max-statements */
let throng = require('throng');
let Queue = require('bull');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const { s3 } = require('./awsconfig');

const exec = promisify(require('child_process').exec)
const writeFileAsync = promisify(fs.writeFile)
const ffprobeAsync = promisify(ffmpeg.ffprobe)
const unlinkAsync = promisify(fs.unlink)

// Connect to a local redis intance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 2;

// The maxium number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network 
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = 10;

function start() {
  // Connect to the named work queue
  let videoQueue = new Queue('video processing', REDIS_URL);

  videoQueue.process(maxJobsPerWorker, async (job) => {
    // This is an example job that just slowly reports on progress
    // while doing no work. Replace this with your own job logic.
    const { file1Info, file2Info, delay } = job.data;
    console.log('job.data: ', job.data);

    try {

      console.log('dirname in worker: ', __dirname)
      // crop & trim vid 2
      // FIXME: below command is failing (no such file or directory)
      if (file2Info.orientation === 'portrait') await exec(`ffmpeg -i ${file2Info.originalName}.mov ${delay ? `-ss ${delay} -t ${file2Info.duration} -async 1 ` : ''}-filter:v "crop=iw:${file2Info.croppedHeight}:0:${file2Info.offset}" -preset ultrafast -c:a copy ${file2Info.originalName}cropped.mov`)
      if (file2Info.orientation === 'landscape') await exec(`ffmpeg -i /app/server/api/${file2Info.originalName}.mov ${delay ? `-ss ${delay} -t ${file2Info.duration} -async 1 ` : ''}-filter:v "crop=${file2Info.croppedWidth}:ih:${file2Info.offset}:0" -preset ultrafast -c:a copy /app/server/api/${file2Info.originalName}cropped.mov`)
      console.log('cropped and trimmed video 2!')

      // if file1 is shorter than file2, scale it up
      if (file1Info.height < file2Info.croppedHeight) await exec(`ffmpeg -i server/api/${file1Info.originalName}.mov -vf scale=-2:${file2Info.croppedHeight} server/api/${file1Info.originalName}scaled.mov`)
      // if file2 is shorter than file1, scale it up
      if (file2Info.croppedHeight < file1Info.height) await exec(`ffmpeg -i server/api/${file2Info.originalName}cropped.mov -vf scale=-2:${file1Info.height} server/api/${file2Info.originalName}scaled.mov`)
      console.log('scaled smaller vid!')

      // if they are already the same height, no need to scale, just merge!
      if (!file1Info.isTallest && !file2Info.isTallest) await exec(`ffmpeg -i server/api/${file1Info.originalName}.mov -i server/api/${file2Info.originalName}cropped.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -ac 2 server/api/${file1Info.originalName}${file2Info.originalName}combined.mov`)
      // if the smaller vid has been scaled:
      if (file1Info.isTallest || file2Info.isTallest) await exec(`ffmpeg -i server/api/${file1Info.isTallest ? `${file1Info.originalName}` : `${file1Info.originalName}scaled`}.mov -i server/api/${file2Info.isTallest ? `${file2Info.originalName}cropped` : `${file2Info.originalName}scaled`}.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -ac 2 server/api/${file1Info.originalName}${file2Info.originalName}combined.mov`)
      console.log('combined vids!')

      // post video to AWS
      const key = uuidv4();
      console.log('key: ', key)
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: fs.createReadStream(`${__dirname}/${file1Info.originalName}${file2Info.originalName}combined.mov`),
      }
      s3.upload(params, async (err, data) => {
        if (err) {
          console.log('error uploading to s3: ', err)
          throw new Error(err);
        } else {
          console.log('success uploading to s3! data: ', data);
          // delete all vids
          await unlinkAsync(`${__dirname}/${file1Info.originalName}.mov`)
          console.log('deleted video 1')
          await unlinkAsync(`${__dirname}/${file2Info.originalName}.mov`)
          console.log('deleted video 2')
          await unlinkAsync(`${__dirname}/${file2Info.originalName}cropped.mov`)
          console.log('deleted cropped video 2')
          if (file1Info.height < file2Info.croppedHeight) {
            await unlinkAsync(`${__dirname}/${file1Info.originalName}scaled.mov`)
            console.log('deleted video 1 scaled')
          }
          if (file2Info.croppedHeight < file1Info.height) {
            await unlinkAsync(`${__dirname}/${file2Info.originalName}scaled.mov`)
            console.log('deleted video 2 scaled')
          }
          await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}combined.mov`)
          console.log('deleted combined video')
          return { key };
        }
      })
    } catch (e) {
      console.log('error: ', e)
      throw new Error(e);
    }
  });

  videoQueue.on('completed', (job, result) => {
    console.log(`Job #${job.id} completed with the following result: `, result)
  })
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
