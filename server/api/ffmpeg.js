const express = require('express');
const router = express.Router();
let Queue = require('bull');

let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let videoQueue = new Queue('video processing', REDIS_URL);

router.get('/jobs/getJobs', async (req, res, next) => {
  try {
    const jobs = await videoQueue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
    res.status(200).send(jobs);
  } catch (e) {
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

router.delete('/jobs/removeJobs', async (req, res, next) => {
  try {
    const jobs = await videoQueue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
    jobs.forEach(async job => {
      try {
        await job.releaseLock(job.lockKey());
        job.remove();
      } catch (e) {
        console.log('error removing job: ', e)
      }
    })
    res.status(200).send('removed all jobs');
  } catch (e) {
    res.status(400).send(e)
  }
});

router.post('/job/duette/:duetteKey/:accompanimentKey/:delay?', async (req, res, next) => {
  const { duetteKey, accompanimentKey, delay } = req.params;
  console.log('delay in POST: ', delay)
  const { userName, userEmail } = req.body;
  try {
    let job = await videoQueue.add({
      duetteKey,
      accompanimentKey,
      delay,
      combinedKey: `${accompanimentKey}${duetteKey}`,
      type: 'duette',
      userName,
      userEmail
    })
    res.status(200).send(job);
  } catch (e) {
    console.log('error in job route: ', e)
    res.status(400).send(e)
  }
});

router.post('/job/accompaniment/:tempVidId/:croppedVidId', async (req, res, next) => {
  const { tempVidId, croppedVidId } = req.params;
  try {
    let job = await videoQueue.add({
      tempVidId,
      croppedVidId,
      type: 'accompaniment'
    })
    res.status(200).send(job);
  } catch (e) {
    console.log('error in job route: ', e)
    res.status(400).send(e)
  }
});

module.exports = router;
