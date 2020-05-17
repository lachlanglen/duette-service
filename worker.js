/* eslint-disable complexity */
/* eslint-disable max-statements */
let throng = require('throng');
let Queue = require('bull');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const s3 = require('./server/api/aws/config');
const mailjet = require('node-mailjet')
  .connect(process.env.MAILJET_APIKEY_PUBLIC, process.env.MAILJET_APIKEY_PRIVATE)

const exec = promisify(require('child_process').exec)
const writeFileAsync = promisify(fs.writeFile)
const existsAsync = promisify(fs.access);
const ffprobeAsync = promisify(ffmpeg.ffprobe)
const unlinkAsync = promisify(fs.unlink)

// Connect to a local redis intance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const logoUrl = 'https://duette.s3.us-east-2.amazonaws.com/made-with-duette-300x200.png'

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
    const landscapeRotations = ['-90', '90', -90, 90];

    if (job.data.type === 'duette') {

      const { duetteKey, accompanimentKey, combinedKey, delay, userName, userEmail } = job.data;
      console.log('job.data: ', job.data);

      const accompanimentUrl = `https://duette.s3.us-east-2.amazonaws.com/${accompanimentKey}.mov`;
      const duetteUrl = `https://duette.s3.us-east-2.amazonaws.com/${duetteKey}.mov`;

      const file1Info = {
        originalName: accompanimentKey,
        orientation: '',
        height: null,
        width: null,
        isTallest: false,
        duration: null,
      };
      const file2Info = {
        originalName: duetteKey,
        orientation: '',
        trueHeight: null,
        trueWidth: null,
        croppedHeight: null,
        croppedWidth: null,
        offset: null,
        isTallest: false,
        duration: null,
      };

      try {

        // get metadata on vid 1
        const metadata = await ffprobeAsync(accompanimentUrl)

        // console.log('metadata1: ', metadata)

        file1Info.orientation = landscapeRotations.includes(metadata.streams[0].rotation) === '90' ? 'portrait' : 'landscape';
        file1Info.width = file1Info.orientation === 'portrait' ? metadata.streams[0].height : metadata.streams[0].width;
        file1Info.height = file1Info.orientation === 'portrait' ? metadata.streams[0].width : metadata.streams[0].height;
        file1Info.duration = metadata.streams[0].duration;

        // get metadata on vid 2
        const metadata2 = await ffprobeAsync(duetteUrl);

        // console.log('metadata2: ', metadata2);

        file2Info.orientation = landscapeRotations.includes(metadata2.streams[0].rotation) ? 'portrait' : 'landscape';
        file2Info.trueWidth = file2Info.orientation === 'portrait' ? metadata2.streams[0].height : metadata2.streams[0].width;
        file2Info.trueHeight = file2Info.orientation === 'portrait' ? metadata2.streams[0].width : metadata2.streams[0].height;
        file2Info.croppedHeight = file2Info.orientation === 'portrait' ? (file2Info.trueWidth / 8) * 9 : file2Info.trueHeight;
        file2Info.croppedWidth = file2Info.croppedHeight / 9 * 8;
        file2Info.offset = file2Info.orientation === 'portrait' ? (file2Info.trueHeight - file2Info.croppedHeight) / 2 : (file2Info.trueWidth - file2Info.croppedWidth) / 2;
        file2Info.duration = metadata2.streams[0].duration;

        // if vid croppedHeight is not divisible by 2, reduce by 1px
        if (file1Info.height % 2 === 1) file1Info.height--;
        if (file2Info.croppedHeight % 2 === 1) file2Info.croppedHeight--;

        // note which file will be tallest (largest height res) after cropping
        if (file1Info.height > file2Info.croppedHeight) file1Info.isTallest = true;
        if (file2Info.croppedHeight > file1Info.height) file2Info.isTallest = true;

        console.log('file1Info: ', file1Info);
        console.log('file2Info: ', file2Info);

        job.progress({ percent: 20, currentStep: 'finished getting info' });

        // const command = `ffmpeg -i ${duetteUrl}${delay > 0 && ` -ss ${delay}ms -t ${file2Info.duration}`}${file1Info.height < file2Info.croppedHeight && ` scale=-2:${file2Info.croppedHeight}[left]`} -i ${accompanimentUrl} -i ${logoUrl} -filter_complex "[1]crop=${file2Info.orientation === 'portrait' ? 'iw' : file2Info.croppedWidth}:${file2Info.orientation === 'portrait' ? file2Info.croppedHeight : 'ih'}:${file2Info.orientation === 'portrait' ? 0 : file2Info.offset}:${file2Info.orientation === 'portrait' ? file2Info.offset : 0}${file2Info.croppedHeight < file1Info.height && `,scale=-2:${file1Info.height}[right]`};[0][${file1Info.height < file2Info.croppedHeight ? 'left' : 'right'}]hstack=inputs=2,fade=t=in:duration=1,fade=t=out:start_time=${file2Info.duration > file1Info.duration ? file2Info.duration - 1 : file1Info.duration - 1}:duration=1[bg];[bg][2]overlay=W-w-10:H-h-10:format=auto,format=yuv420p[v];[0:a][1:a]amix,afade=t=in:duration=1,afade=t=out:start_time=${file2Info.duration > file1Info.duration ? file2Info.duration - 1 : file1Info.duration - 1}:duration=1[a]" -map "[v]" -map "[a]" -c:v libx264 -preset ultrafast -c:a aac -ac 2 -movflags +faststart ${file1Info.originalName}${file2Info.originalName}overlay.mov`;

        // await exec(command);

        // crop & trim vid 2
        if (file2Info.orientation === 'portrait') await exec(`ffmpeg -i ${duetteUrl} ${delay ? `-ss ${delay} -t ${file2Info.duration} -async 1 ` : ''}-filter:v "crop=iw:${file2Info.croppedHeight}:0:${file2Info.offset}" -preset ultrafast -c:a copy ${file2Info.originalName}cropped.mov`)
        if (file2Info.orientation === 'landscape') await exec(`ffmpeg -i ${duetteUrl} ${delay ? `-ss ${delay} -t ${file2Info.duration} -async 1 ` : ''}-filter:v "crop=${file2Info.croppedWidth}:ih:${file2Info.offset}:0" -preset ultrafast -c:a copy ${file2Info.originalName}cropped.mov`)
        console.log('cropped and trimmed video 2!')

        // if file1 is shorter than file2, scale it up
        if (file1Info.height < file2Info.croppedHeight) await exec(`ffmpeg -i ${accompanimentUrl} -vf scale=-2:${file2Info.croppedHeight} ${file1Info.originalName}scaled.mov`)
        // if file2 is shorter than file1, scale it up
        if (file2Info.croppedHeight < file1Info.height) await exec(`ffmpeg -i ${file2Info.originalName}cropped.mov -vf scale=-2:${file1Info.height} ${file2Info.originalName}scaled.mov`)
        console.log('scaled smaller vid!')

        job.progress({ percent: 60, currentStep: "finished cropping and trimming" });

        const command1 = `ffmpeg -i ${accompanimentUrl} -i ${file2Info.originalName}cropped.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -preset ultrafast -ac 2 ${file1Info.originalName}${file2Info.originalName}combined.mov`;
        const command2 = `ffmpeg -i ${file1Info.isTallest ? `${accompanimentUrl}` : `${file1Info.originalName}scaled.mov`} -i ${file2Info.isTallest ? `${file2Info.originalName}cropped` : `${file2Info.originalName}scaled`}.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -preset ultrafast -ac 2 ${file1Info.originalName}${file2Info.originalName}combined.mov`;

        console.log('command1: ', command1);
        console.log('command2: ', command2);
        // if they are already the same height, no need to scale, just merge!
        if (!file1Info.isTallest && !file2Info.isTallest) await exec(`ffmpeg -i ${accompanimentUrl} -i ${file2Info.originalName}cropped.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -preset ultrafast -ac 2 ${file1Info.originalName}${file2Info.originalName}combined.mov`)
        console.log('combined vids1!')
        // if the smaller vid has been scaled:
        if (file1Info.isTallest || file2Info.isTallest) await exec(`ffmpeg -i ${file1Info.isTallest ? `${accompanimentUrl}` : `${file1Info.originalName}scaled.mov`} -i ${file2Info.isTallest ? `${file2Info.originalName}cropped` : `${file2Info.originalName}scaled`}.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -preset ultrafast -ac 2 ${file1Info.originalName}${file2Info.originalName}combined.mov`)
        console.log('combined vids2!')

        // add fade in & fade out
        // await exec(`ffmpeg -i ${file1Info.originalName}${file2Info.originalName}combined.mov -sseof -1 -copyts -i ${file1Info.originalName}${file2Info.originalName}combined.mov -filter_complex "[1]fade=out:0:30[t];[0][t]overlay,fade=in:0:30[v]; anullsrc,atrim=0:1[at];[0][at]acrossfade=d=1,afade=d=1[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 22 -preset ultrafast -shortest ${file1Info.originalName}${file2Info.originalName}fadeInOut.mov`)
        await exec(`ffmpeg -i ${file1Info.originalName}${file2Info.originalName}combined.mov -filter_complex "[0:v]fade=type=out:duration=1:start_time=${file1Info.duration < file2Info.duration ? file1Info.duration - 1 : file2Info.duration - 1}[v];[0:a]afade=type=out:duration=1:start_time=${file1Info.duration < file2Info.duration ? file1Info.duration - 1 : file2Info.duration - 1}[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 22 -preset ultrafast -shortest ${file1Info.originalName}${file2Info.originalName}fadeOut.mov`)
        // add overlay
        await exec(`ffmpeg -i ${file1Info.originalName}${file2Info.originalName}fadeOut.mov -i ${logoUrl} -filter_complex overlay=W-w-10:H-h-10 -codec:a copy -preset ultrafast -async 1 ${file1Info.originalName}${file2Info.originalName}overlay.mov`)
        console.log('added overlay!')

        // create thumbnail

        await exec(`ffmpeg -i ${file1Info.originalName}${file2Info.originalName}overlay.mov -vframes 1 -an -ss 3 ${file1Info.originalName}${file2Info.originalName}thumbnail.png`);

        console.log('done!')
        // post video to AWS
        const vidParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${combinedKey}.mov`,
          Body: fs.createReadStream(`${__dirname}/${file1Info.originalName}${file2Info.originalName}overlay.mov`),
        };

        const thumbnailParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${file1Info.originalName}${file2Info.originalName}thumbnail.png`,
          Body: fs.createReadStream(`${__dirname}/${file1Info.originalName}${file2Info.originalName}thumbnail.png`),
        }

        s3.upload(vidParams, async (err, data) => {
          if (err) {
            console.log('error uploading to s3: ', err)
            throw new Error(err);
          } else {
            console.log('success uploading video to s3! data: ', data);
            s3.upload(thumbnailParams, async (error, d) => {
              if (error) {
                console.log('error uploading thumbnail to s3: ', error)
                throw new Error(err);
              } else {
                console.log('success uploading thumbnail to s3! data: ', d);
                // delete all vids
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
                await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}combined.mov`);
                await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}overlay.mov`);
                await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}fadeOut.mov`);
                await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}thumbnail.png`);
                console.log('deleted combined video, overlay & fade in/out');
                job.progress({ percent: 95, currentStep: 'finished saving' });
                // send email to user
                mailjet
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
                            Email: userEmail,
                            Name: userName
                          }
                        ],
                        Subject: 'Your video is ready!',
                        // TextPart: 'My first Mailjet email',
                        HTMLPart: `<h4>Hi ${userName},</h4><div>Your Duette has finished processing!</div><h4><a href=${data.Location}>Click here</a> to download your video.</h4><div>Thanks for using Duette. See you next time!</div><div>- Team Duette</div>`,
                        CustomID: duetteKey
                      }
                    ]
                  })
                  .then(res => {
                    console.log('success sending email! response: ', res.body);
                    return { combinedKey };
                  })
                  .catch(e => console.log('error sending email: ', e))
              }
            })
          }
        })
      } catch (error) {
        console.log('error in duette worker: ', error);
        fs.access(`${__dirname}/${file2Info.originalName}cropped.mov`, fs.constants.F_OK, async err => {
          if (err) {
            throw new Error(error);
          } else {
            await unlinkAsync(`${__dirname}/${file2Info.originalName}cropped.mov`);
            fs.access(`${__dirname}/${file1Info.height < file2Info.croppedHeight ? file1Info.originalName : file2Info.originalName}scaled.mov`, fs.constants.F_OK, async e => {
              if (e) {
                throw new Error(error);
              } else {
                await unlinkAsync(`${__dirname}/${file1Info.height < file2Info.croppedHeight ? file1Info.originalName : file2Info.originalName}scaled.mov`);
                fs.access(`${__dirname}/${file2Info.originalName}scaled.mov`, fs.constants.F_OK, async er => {
                  if (er) {
                    try {
                      await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}combined.mov`);
                      await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}overlay.mov`);
                      await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}fadeOut.mov`);
                      await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}thumbnail.png`);
                    } catch (E) {
                      throw new Error(E);
                    }
                  } else {
                    try {
                      await unlinkAsync(`${__dirname}/${file2Info.originalName}scaled.mov`);
                      await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}combined.mov`);
                      await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}overlay.mov`);
                      await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}fadeOut.mov`);
                      await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}thumbnail.png`);
                    } catch (E) {
                      throw new Error(E);
                    }
                  }
                })
              }
            })
          }
        })
      }
    } else {
      // job.data.type === 'accompaniment'
      const { tempVidId, croppedVidId } = job.data;
      const vidUrl = `https://duette.s3.us-east-2.amazonaws.com/${tempVidId}`;

      const fileInfo = {
        originalName: tempVidId,
        orientation: '',
        trueHeight: null,
        trueWidth: null,
        croppedHeight: null,
        croppedWidth: null,
        offset: null,
        duration: null,
      };

      try {
        // get metadata on vid file
        const metadata = await ffprobeAsync(vidUrl)

        console.log('metadata: ', metadata)

        fileInfo.orientation = metadata.streams[0].rotation === '-90' || metadata.streams[0].rotation === '90' ? 'portrait' : 'landscape';
        fileInfo.trueWidth = fileInfo.orientation === 'portrait' ? metadata.streams[0].height : metadata.streams[0].width;
        fileInfo.trueHeight = fileInfo.orientation === 'portrait' ? metadata.streams[0].width : metadata.streams[0].height;
        fileInfo.croppedHeight = fileInfo.orientation === 'portrait' ? (fileInfo.trueWidth / 8) * 9 : fileInfo.trueHeight;
        fileInfo.croppedWidth = fileInfo.croppedHeight / 9 * 8;
        fileInfo.offset = fileInfo.orientation === 'portrait' ? (fileInfo.trueHeight - fileInfo.croppedHeight) / 2 : (fileInfo.trueWidth - fileInfo.croppedWidth) / 2;
        fileInfo.duration = metadata.streams[0].duration;

        // if vid croppedHeight is not divisible by 2, reduce by 1px
        if (fileInfo.croppedHeight % 2 === 1) fileInfo.croppedHeight--;

        console.log('fileInfo: ', fileInfo);

        job.progress({ percent: 20, currentStep: "finished getting info" });

        // crop & trim vid
        if (fileInfo.orientation === 'portrait') await exec(`ffmpeg -i ${vidUrl} -ss 0.05 -t ${fileInfo.duration} -async 1 -filter:v "crop=iw:${fileInfo.croppedHeight}:0:${fileInfo.offset}" -preset ultrafast -c:a copy ${fileInfo.originalName}cropped.mov`)
        if (fileInfo.orientation === 'landscape') await exec(`ffmpeg -i ${vidUrl} -ss 0.05 -t ${fileInfo.duration} -async 1 -filter:v "crop=${fileInfo.croppedWidth}:ih:${fileInfo.offset}:0" -preset ultrafast -c:a copy ${fileInfo.originalName}cropped.mov`)
        console.log('cropped and trimmed accompaniment video!');

        // create thumbnail

        await exec(`ffmpeg -i ${fileInfo.originalName}cropped.mov -vframes 1 -an -ss 3 ${fileInfo.originalName}thumbnail.png`);
        console.log('created thumbnail!');

        job.progress({ percent: 60, currentStep: "finished cropping and trimming" });

        // post video to AWS
        const vidParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${croppedVidId}.mov`,
          Body: fs.createReadStream(`${__dirname}/${fileInfo.originalName}cropped.mov`),
        }

        const thumbnailParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${croppedVidId}thumbnail.png`,
          Body: fs.createReadStream(`${__dirname}/${fileInfo.originalName}thumbnail.png`),
        }

        s3.upload(vidParams, (err, data) => {
          if (err) {
            console.log('error uploading video to s3: ', err)
            throw new Error(err);
          } else {
            console.log('success uploading video to s3! data: ', data);
            // upload thumbnail
            s3.upload(thumbnailParams, async (error, d) => {
              if (error) {
                console.log('error uploading thumbnail to s3: ', error)
                throw new Error(err);
              } else {
                console.log('success uploading thumbnail to s3! data: ', d);
                // delete all files
                await unlinkAsync(`${__dirname}/${fileInfo.originalName}cropped.mov`);
                await unlinkAsync(`${__dirname}/${fileInfo.originalName}thumbnail.png`);
                console.log('deleted cropped video and thumbnail');
                job.progress({ percent: 95, currentStep: 'finished saving' });
              }
            })
          }
        })
        return { croppedVidId };
      } catch (e) {
        console.log('error in accompaniment worker: ', e)
        throw new Error(e);
      }
    }
  });

  videoQueue.on('completed', (job, result) => {
    console.log(`Job #${job.id} completed with the following result: `, result)
  })
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
