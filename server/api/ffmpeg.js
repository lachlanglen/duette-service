/* eslint-disable no-lonely-if */
/* eslint-disable complexity */
/* eslint-disable max-statements */
const AWS = require('aws-sdk');
const express = require('express');
const router = express.Router();
const ffmpeg = require("fluent-ffmpeg");
const multer = require('multer')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
// const s3 = require('../../awsconfig');
const { promisify } = require('util');
let Queue = require('bull');
const { s3 } = require('../../awsconfig');

const exec = promisify(require('child_process').exec)
const writeFileAsync = promisify(fs.writeFile)
const ffprobeAsync = promisify(ffmpeg.ffprobe)
const unlinkAsync = promisify(fs.unlink)

const storage = multer.memoryStorage()
const upload = multer({ storage });

let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let videoQueue = new Queue('video processing', REDIS_URL);

router.post('/job/:delay?', upload.array('videos', 2), async (req, res, next) => {
  const { delay } = req.params;
  console.log('delay: ', delay)

  const file1Info = {
    originalName: req.files[0].originalname,
    orientation: '',
    height: null,
    width: null,
    isTallest: false,
  };
  const file2Info = {
    originalName: req.files[1].originalname,
    orientation: '',
    trueHeight: null,
    trueWidth: null,
    croppedHeight: null,
    croppedWidth: null,
    offset: null,
    isTallest: false,
    duration: null,
  };

  console.log('dirname: ', __dirname)

  try {
    // create a file on server for each vid
    await writeFileAsync(`/app/${file1Info.originalName}.mov`, req.files[0].buffer);
    await writeFileAsync(`/app/${file2Info.originalName}.mov`, req.files[1].buffer);
    // await writeFileAsync(`${__dirname}/${file1Info.originalName}.mov`, req.files[0].buffer);
    // await writeFileAsync(`${__dirname}/${file2Info.originalName}.mov`, req.files[1].buffer);

    // get metadata on vid 1
    const metadata = await ffprobeAsync(`server/api/${file1Info.originalName}.mov`)

    // console.log('metadata1: ', metadata)

    if (!metadata.streams[0].rotation) {
      console.log('undefined rotation in file 1')
      // res.status(400).send(`unsupported orientation in file ${file1Info.originalName}`)
    }

    console.log('metadata.streams[0].rotation: ', metadata.streams[0].rotation);

    file1Info.orientation = metadata.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    file1Info.width = file1Info.orientation === 'portrait' ? metadata.streams[0].height : metadata.streams[0].width;
    file1Info.height = file1Info.orientation === 'portrait' ? metadata.streams[0].width : metadata.streams[0].height;

    // get metadata on vid 2
    const metadata2 = await ffprobeAsync(`server/api/${file2Info.originalName}.mov`)

    // console.log('metadata2: ', metadata2)

    if (!metadata2.streams[0].rotation) {
      console.log('undefined rotation in file 2')
      // res.status(400).send(`unsupported orientation in file ${file2Info.originalName}`)
    }

    console.log('metadata2.streams[0].rotation: ', metadata2.streams[0].rotation);

    file2Info.orientation = metadata2.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    file2Info.trueWidth = file2Info.orientation === 'portrait' ? metadata2.streams[0].height : metadata2.streams[0].width;
    file2Info.trueHeight = file2Info.orientation === 'portrait' ? metadata2.streams[0].width : metadata2.streams[0].height;
    file2Info.croppedHeight = file2Info.orientation === 'portrait' ? (file2Info.trueWidth / 8) * 9 : file2Info.trueHeight;
    file2Info.croppedWidth = file2Info.croppedHeight / 9 * 8;
    file2Info.offset = file2Info.orientation === 'portrait' ? (file2Info.trueHeight - file2Info.croppedHeight) / 2 : (file2Info.trueWidth - file2Info.croppedWidth) / 2;
    file2Info.duration = metadata2.streams[0].duration;

    // note which file will be tallest (largest height res) after cropping
    if (file1Info.height > file2Info.croppedHeight) file1Info.isTallest = true;
    if (file2Info.croppedHeight > file1Info.height) file2Info.isTallest = true;

    // if vid croppedHeight is not divisible by 2, reduce by 1px
    if (file1Info.height % 2 === 1) file1Info.height--;
    if (file2Info.croppedHeight % 2 === 1) file2Info.croppedHeight--;

    let job = await videoQueue.add({
      file1Info,
      file2Info,
      delay,
    })

    console.log('job: ', job)

    res.status(200).send(job);
  } catch (e) {
    console.log('error in job route: ', e)
    res.status(400).send(e)
  }
});

router.get('/job/:id', async (req, res) => {
  let id = req.params.id;
  let job = await videoQueue.getJob(id);

  if (job === null) {
    res.status(404).end();
  } else {
    let state = await job.getState();
    let progress = job._progress;
    let reason = job.failedReason;
    res.status(200).send({ state, progress, reason });
  }
});

router.post('/accompaniment', upload.single('video'), async (req, res, next) => {

  req.connection.setTimeout(1000 * 60 * 30); // thirty minutes

  const fileInfo = {
    originalName: req.file.originalname,
    orientation: '',
    trueHeight: null,
    trueWidth: null,
    croppedHeight: null,
    croppedWidth: null,
    offset: null,
    duration: null,
  };

  try {
    // create a file on server
    await writeFileAsync(`${__dirname}/${fileInfo.originalName}.mov`, req.file.buffer);

    // get metadata on vid file
    const metadata = await ffprobeAsync(`server/api/${fileInfo.originalName}.mov`)

    console.log('metadata: ', metadata.streams[0].duration)

    if (!metadata.streams[0].rotation) {
      console.log('undefined rotation in file 1')
      // res.status(400).send(`unsupported orientation in file ${fileInfo.originalName}`)
    }

    console.log('metadata.streams[0].rotation: ', metadata.streams[0].rotation);

    fileInfo.orientation = metadata.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    fileInfo.trueWidth = fileInfo.orientation === 'portrait' ? metadata.streams[0].height : metadata.streams[0].width;
    fileInfo.trueHeight = fileInfo.orientation === 'portrait' ? metadata.streams[0].width : metadata.streams[0].height;
    fileInfo.croppedHeight = fileInfo.orientation === 'portrait' ? (fileInfo.trueWidth / 8) * 9 : fileInfo.trueHeight;
    fileInfo.croppedWidth = fileInfo.croppedHeight / 9 * 8;
    fileInfo.offset = fileInfo.orientation === 'portrait' ? (fileInfo.trueHeight - fileInfo.croppedHeight) / 2 : (fileInfo.trueWidth - fileInfo.croppedWidth) / 2;
    fileInfo.duration = metadata.streams[0].duration;

    // if vid croppedHeight is not divisible by 2, reduce by 1px
    if (fileInfo.croppedHeight % 2 === 1) fileInfo.croppedHeight--;

    console.log('fileInfo: ', fileInfo);

    // crop & trim vid
    if (fileInfo.orientation === 'portrait') await exec(`ffmpeg -i server/api/${fileInfo.originalName}.mov -ss 0.05 -t ${fileInfo.duration} -async 1 -filter:v "crop=iw:${fileInfo.croppedHeight}:0:${fileInfo.offset}" -preset ultrafast -c:a copy server/api/${fileInfo.originalName}cropped.mov`)
    if (fileInfo.orientation === 'landscape') await exec(`ffmpeg -i server/api/${fileInfo.originalName}.mov -ss 0.05 -t ${fileInfo.duration} -async 1 -filter:v "crop=${fileInfo.croppedWidth}:ih:${fileInfo.offset}:0" -preset ultrafast -c:a copy server/api/${fileInfo.originalName}cropped.mov`)
    console.log('cropped and trimmed accompaniment video!')

    // // add logo

    // await exec(`ffmpeg -i server/api/${fileInfo.originalName}cropped.mov -i duette-logo.png -filter_complex 'overlay=10:main_h-overlay_h-10' server/api/withlogo.mov`)
    // console.log('logo added!')

    // post video to AWS
    const key = uuidv4();
    console.log('key: ', key)
    const params = {
      Bucket: 'duette',
      Key: key,
      Body: fs.createReadStream(`${__dirname}/${fileInfo.originalName}cropped.mov`),
    }

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log('error uploading to S3: ', err);
        res.status(400).send('error uploading to s3: ', err);
      } else {
        console.log('success uploading to s3! data: ', data);
        // delete all vids
        await unlinkAsync(`${__dirname}/${fileInfo.originalName}.mov`)
        console.log('deleted original video')
        await unlinkAsync(`${__dirname}/${fileInfo.originalName}cropped.mov`)
        console.log('deleted cropped video')
        res.status(200).send(key)
      }
    })
  } catch (e) {
    console.log('error writing files: ', e)
    res.status(400).send(e)
  }
})

router.post('/duette/getinfo', upload.array('videos', 2), async (req, res, next) => {

  const file1Info = {
    originalName: req.files[0].originalname,
    orientation: '',
    height: null,
    width: null,
    isTallest: false,
  };

  const file2Info = {
    originalName: req.files[1].originalname,
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
    // create a file on server for each vid
    await writeFileAsync(`${__dirname}/${file1Info.originalName}.mov`, req.files[0].buffer);
    await writeFileAsync(`${__dirname}/${file2Info.originalName}.mov`, req.files[1].buffer);

    // get metadata on vid 1
    const metadata = await ffprobeAsync(`server/api/${file1Info.originalName}.mov`)

    console.log('metadata1: ', metadata)

    if (!metadata.streams[0].rotation) {
      console.log('undefined rotation in file 1')
      // res.status(400).send(`unsupported orientation in file ${file1Info.originalName}`)
    }

    console.log('metadata.streams[0].rotation: ', metadata.streams[0].rotation);

    file1Info.orientation = metadata.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    file1Info.width = file1Info.orientation === 'portrait' ? metadata.streams[0].height : metadata.streams[0].width;
    file1Info.height = file1Info.orientation === 'portrait' ? metadata.streams[0].width : metadata.streams[0].height;

    // get metadata on vid 2
    const metadata2 = await ffprobeAsync(`server/api/${file2Info.originalName}.mov`)

    console.log('metadata2: ', metadata2)

    if (!metadata2.streams[0].rotation) {
      console.log('undefined rotation in file 2')
      // res.status(400).send(`unsupported orientation in file ${file2Info.originalName}`)
    }

    console.log('metadata2.streams[0].rotation: ', metadata2.streams[0].rotation);

    file2Info.orientation = metadata2.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    file2Info.trueWidth = file2Info.orientation === 'portrait' ? metadata2.streams[0].height : metadata2.streams[0].width;
    file2Info.trueHeight = file2Info.orientation === 'portrait' ? metadata2.streams[0].width : metadata2.streams[0].height;
    file2Info.croppedHeight = file2Info.orientation === 'portrait' ? (file2Info.trueWidth / 8) * 9 : file2Info.trueHeight;
    file2Info.croppedWidth = file2Info.croppedHeight / 9 * 8;
    file2Info.offset = file2Info.orientation === 'portrait' ? (file2Info.trueHeight - file2Info.croppedHeight) / 2 : (file2Info.trueWidth - file2Info.croppedWidth) / 2;
    file2Info.duration = metadata2.streams[0].duration;

    // note which file will be tallest (largest height res) after cropping
    if (file1Info.height > file2Info.croppedHeight) file1Info.isTallest = true;
    if (file2Info.croppedHeight > file1Info.height) file2Info.isTallest = true;

    // if vid croppedHeight is not divisible by 2, reduce by 1px
    if (file1Info.height % 2 === 1) file1Info.height--;
    if (file2Info.croppedHeight % 2 === 1) file2Info.croppedHeight--;

    console.log('file1Info: ', file1Info);
    console.log('file2Info: ', file2Info);

    res.status(200).send([file1Info, file2Info])

  } catch (e) {
    console.log('error writing files: ', e)
    res.status(400).send(e)
  }
});

router.post('/duette/crop/:delay?', async (req, res, next) => {
  console.log('req.body in duette/crop: ', req.body);
  const { delay } = req.params;
  console.log('delay: ', delay)
  const file2Info = req.body[1];

  try {
    if (file2Info.orientation === 'portrait') await exec(`ffmpeg -i server/api/${file2Info.originalName}.mov ${delay ? `-ss ${delay} -t ${file2Info.duration} -async 1 ` : ''}-filter:v "crop=iw:${file2Info.croppedHeight}:0:${file2Info.offset}" -preset ultrafast -c:a copy server/api/${file2Info.originalName}cropped.mov`)
    if (file2Info.orientation === 'landscape') await exec(`ffmpeg -i server/api/${file2Info.originalName}.mov ${delay ? `-ss ${delay} -t ${file2Info.duration} -async 1 ` : ''}-filter:v "crop=${file2Info.croppedWidth}:ih:${file2Info.offset}:0" -preset ultrafast -c:a copy server/api/${file2Info.originalName}cropped.mov`)
    console.log('cropped and trimmed video 2!')

    res.status(200).send(`server/api/${file2Info.originalName}cropped.mov`)
  } catch (e) {
    console.log('error cropping and trimming: ', e)
    res.status(400).send(e)
  }
});

router.post('/duette/scale', async (req, res, next) => {
  console.log('req.body in duette/scale: ', req.body);
  const file1Info = req.body[0];
  const file2Info = req.body[1];
  const croppedPath = req.body[2];
  try {
    // if file1 is shorter than file2, scale it up
    if (file1Info.height < file2Info.croppedHeight) await exec(`ffmpeg -i server/api/${file1Info.originalName}.mov -vf scale=-2:${file2Info.croppedHeight} server/api/${file1Info.originalName}scaled.mov`)
    // if file2 is shorter than file1, scale it up
    if (file2Info.croppedHeight < file1Info.height) await exec(`ffmpeg -i ${croppedPath} -vf scale=-2:${file1Info.height} server/api/${file2Info.originalName}scaled.mov`)
    console.log('scaled smaller vid!')
    res.status(200).send(`server/api/${file2Info.originalName}scaled.mov`);
  } catch (e) {
    console.log('error scaling: ', e)
    res.status(400).send(e)
  }
});

router.post('/duette/combine', async (req, res, next) => {
  console.log('req.body in duette/combine: ', req.body);
  const file1Info = req.body[0];
  const file2Info = req.body[1];
  const croppedPath = req.body[2];
  const scaledPath = req.body[3];
  try {
    if (!file1Info.isTallest && !file2Info.isTallest) await exec(`ffmpeg -i server/api/${file1Info.originalName}.mov -i ${croppedPath} -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -ac 2 server/api/${file1Info.originalName}${file2Info.originalName}combined.mov`)
    // if the smaller vid has been scaled:
    if (file1Info.isTallest || file2Info.isTallest) await exec(`ffmpeg -i server/api/${file1Info.isTallest ? `${file1Info.originalName}` : `${scaledPath}`}.mov -i server/api/${file2Info.isTallest ? `${croppedPath}` : `${scaledPath}`}.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -ac 2 server/api/${file1Info.originalName}${file2Info.originalName}combined.mov`)
    console.log('combined vids!')
    res.status(200).send(`server/api/${file1Info.originalName}${file2Info.originalName}combined.mov`)
  } catch (e) {
    console.log('error combining videos: ', e)
    res.status(400).send(e)
  }
});

router.post('/duette/aws', async (req, res, next) => {
  console.log('req.body in duette/aws: ', req.body);
  const file1Info = req.body[0];
  const file2Info = req.body[1];
  const croppedPath = req.body[2];
  const scaledPath = req.body[3];
  const combinedPath = req.body[4];
  // post video to AWS
  const key = uuidv4();
  console.log('key: ', key)
  const params = {
    Bucket: req.bucketName,
    Key: key,
    Body: fs.createReadStream(`${__dirname}/${combinedPath}`),
  }
  s3.upload(params, async (err, data) => {
    if (err) {
      console.log('error uploading to S3: ', err);
      res.status(400).send('error uploading to s3: ', err);
    } else {
      console.log('success uploading to s3! data: ', data);
      // delete all vids
      try {
        await unlinkAsync(`${__dirname}/${file1Info.originalName}.mov`)
        console.log('deleted video 1')
        await unlinkAsync(`${__dirname}/${file2Info.originalName}.mov`)
        console.log('deleted video 2')
        await unlinkAsync(`${__dirname}/${croppedPath}`)
        console.log('deleted cropped video 2')
        if (file1Info.height < file2Info.croppedHeight) {
          await unlinkAsync(`${__dirname}/${scaledPath}`)
          console.log('deleted video 1 scaled')
        }
        if (file2Info.croppedHeight < file1Info.height) {
          await unlinkAsync(`${__dirname}/${scaledPath}`)
          console.log('deleted video 2 scaled')
        }
        await unlinkAsync(`${__dirname}/${combinedPath}`)
        console.log('deleted combined video')
        res.status(200).send(key)
      } catch (e) {
        console.log('error deleting videos: ', e)
        res.status(400).send(e)
      }
    }
  });
});



// OLD ROUTE:

router.post('/duette/:delay?', upload.array('videos', 2), async (req, res, next) => {
  req.connection.setTimeout(1000 * 60 * 30); // thirty minutes

  const { delay } = req.params;
  console.log('delay: ', delay)

  const file1Info = {
    originalName: req.files[0].originalname,
    orientation: '',
    height: null,
    width: null,
    isTallest: false,
  };
  const file2Info = {
    originalName: req.files[1].originalname,
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
    // create a file on server for each vid
    await writeFileAsync(`${__dirname}/${file1Info.originalName}.mov`, req.files[0].buffer);
    await writeFileAsync(`${__dirname}/${file2Info.originalName}.mov`, req.files[1].buffer);

    // get metadata on vid 1
    const metadata = await ffprobeAsync(`server/api/${file1Info.originalName}.mov`)

    console.log('metadata1: ', metadata)

    if (!metadata.streams[0].rotation) {
      console.log('undefined rotation in file 1')
      // res.status(400).send(`unsupported orientation in file ${file1Info.originalName}`)
    }

    console.log('metadata.streams[0].rotation: ', metadata.streams[0].rotation);

    file1Info.orientation = metadata.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    file1Info.width = file1Info.orientation === 'portrait' ? metadata.streams[0].height : metadata.streams[0].width;
    file1Info.height = file1Info.orientation === 'portrait' ? metadata.streams[0].width : metadata.streams[0].height;

    // get metadata on vid 2
    const metadata2 = await ffprobeAsync(`server/api/${file2Info.originalName}.mov`)

    console.log('metadata2: ', metadata2)

    if (!metadata2.streams[0].rotation) {
      console.log('undefined rotation in file 2')
      // res.status(400).send(`unsupported orientation in file ${file2Info.originalName}`)
    }

    console.log('metadata2.streams[0].rotation: ', metadata2.streams[0].rotation);

    file2Info.orientation = metadata2.streams[0].rotation === '-90' ? 'portrait' : 'landscape';
    file2Info.trueWidth = file2Info.orientation === 'portrait' ? metadata2.streams[0].height : metadata2.streams[0].width;
    file2Info.trueHeight = file2Info.orientation === 'portrait' ? metadata2.streams[0].width : metadata2.streams[0].height;
    file2Info.croppedHeight = file2Info.orientation === 'portrait' ? (file2Info.trueWidth / 8) * 9 : file2Info.trueHeight;
    file2Info.croppedWidth = file2Info.croppedHeight / 9 * 8;
    file2Info.offset = file2Info.orientation === 'portrait' ? (file2Info.trueHeight - file2Info.croppedHeight) / 2 : (file2Info.trueWidth - file2Info.croppedWidth) / 2;
    file2Info.duration = metadata2.streams[0].duration;

    // note which file will be tallest (largest height res) after cropping
    if (file1Info.height > file2Info.croppedHeight) file1Info.isTallest = true;
    if (file2Info.croppedHeight > file1Info.height) file2Info.isTallest = true;

    // if vid croppedHeight is not divisible by 2, reduce by 1px
    if (file1Info.height % 2 === 1) file1Info.height--;
    if (file2Info.croppedHeight % 2 === 1) file2Info.croppedHeight--;

    console.log('file1Info: ', file1Info);
    console.log('file2Info: ', file2Info);

    // TODO: res.send file1Info and file2Info as an array of objects

    // crop & trim vid 2
    if (file2Info.orientation === 'portrait') await exec(`ffmpeg -i server/api/${file2Info.originalName}.mov ${delay ? `-ss ${delay} -t ${file2Info.duration} -async 1 ` : ''}-filter:v "crop=iw:${file2Info.croppedHeight}:0:${file2Info.offset}" -preset ultrafast -c:a copy server/api/${file2Info.originalName}cropped.mov`)
    if (file2Info.orientation === 'landscape') await exec(`ffmpeg -i server/api/${file2Info.originalName}.mov ${delay ? `-ss ${delay} -t ${file2Info.duration} -async 1 ` : ''}-filter:v "crop=${file2Info.croppedWidth}:ih:${file2Info.offset}:0" -preset ultrafast -c:a copy server/api/${file2Info.originalName}cropped.mov`)
    console.log('cropped and trimmed video 2!')

    // TODO: res.send cropped file name (server/api/${file2Info.originalName}cropped.mov)

    // if file1 is shorter than file2, scale it up
    if (file1Info.height < file2Info.croppedHeight) await exec(`ffmpeg -i server/api/${file1Info.originalName}.mov -vf scale=-2:${file2Info.croppedHeight} server/api/${file1Info.originalName}scaled.mov`)
    // if file2 is shorter than file1, scale it up
    if (file2Info.croppedHeight < file1Info.height) await exec(`ffmpeg -i server/api/${file2Info.originalName}cropped.mov -vf scale=-2:${file1Info.height} server/api/${file2Info.originalName}scaled.mov`)
    console.log('scaled smaller vid!')

    // TODO: res.send scaled file name (server/api/${file2Info.originalName}scaled.mov)

    // const croppedmetadata = await ffprobeAsync(`server/api/${file1Info.originalName}cropped.mov`)
    // const croppedMetadata2 = await ffprobeAsync(`server/api/${file2Info.originalName}cropped.mov`)

    // console.log('croppedmetadata: ', croppedmetadata);
    // console.log('croppedMetadata2: ', croppedMetadata2);

    // if they are already the same height, no need to scale, just merge!
    if (!file1Info.isTallest && !file2Info.isTallest) await exec(`ffmpeg -i server/api/${file1Info.originalName}.mov -i server/api/${file2Info.originalName}cropped.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -ac 2 server/api/${file1Info.originalName}${file2Info.originalName}combined.mov`)
    // if the smaller vid has been scaled:
    if (file1Info.isTallest || file2Info.isTallest) await exec(`ffmpeg -i server/api/${file1Info.isTallest ? `${file1Info.originalName}` : `${file1Info.originalName}scaled`}.mov -i server/api/${file2Info.isTallest ? `${file2Info.originalName}cropped` : `${file2Info.originalName}scaled`}.mov -filter_complex "[0:v][1:v] hstack=inputs=2[v]; [0:a][1:a]amix[a]" -map "[v]" -map "[a]" -ac 2 server/api/${file1Info.originalName}${file2Info.originalName}combined.mov`)
    console.log('combined vids!')

    // TODO: res.send combined path (server/api/${file1Info.originalName}${file2Info.originalName}combined.mov)

    // post video to AWS
    const key = uuidv4();
    console.log('key: ', key)
    const params = {
      Bucket: req.bucketName,
      Key: key,
      Body: fs.createReadStream(`${__dirname}/${file1Info.originalName}${file2Info.originalName}combined.mov`),
    }
    s3.upload(params, async (err, data) => {
      if (err) {
        console.log('error uploading to S3: ', err);
        res.status(400).send('error uploading to s3: ', err);
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
        // await unlinkAsync(`${__dirname}/${file1Info.originalName}${file2Info.originalName}combined.mov`)
        // console.log('deleted combined video')
        res.status(200).send(key)
      }
    })
  } catch (e) {
    console.log('error writing files: ', e)
    res.status(400).send(e)
  }
})

module.exports = router;