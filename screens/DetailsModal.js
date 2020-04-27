/* eslint-disable complexity */
/* eslint-disable max-statements */
import React, { useState } from 'react';
// import { withRouter } from 'react-router-dom'
import { Image, Text, View, Modal, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { connect } from 'react-redux';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import axios from 'axios';
import CatsGallery from './CatsGallery';
import { fetchVideos } from '../redux/videos';
import { Polly } from 'aws-sdk';
import Form from '../components/Form';

const DetailsModal = (props) => {
  const { setRecord, setPreview, setShowDetailsModal, handleDetailsExit, dataUri } = props;

  const [formRef, setFormRef] = useState(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [infoGettingInProgress, setInfoGettingInProgress] = useState(false);
  const [infoGettingDone, setInfoGettingDone] = useState(false);
  const [croppingInProgress, setCroppingInProgress] = useState(false);
  const [croppingDone, setCroppingDone] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [savingDone, setSavingDone] = useState(false);

  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [songKey, setSongKey] = useState('');
  const [performer, setPerformer] = useState(props.user.name);

  const jobs = [];

  console.log('jobs: ', jobs)

  let croppedVidId;
  let intervalId;

  const download = async () => {
    const s3Url = `https://duette.s3.us-east-2.amazonaws.com/${croppedVidId}`;
    try {
      const { uri } = await FileSystem.downloadAsync(
        s3Url,
        FileSystem.documentDirectory + `${croppedVidId}.mp4`
      )
      console.log('Finished downloading vid to ', uri);
      // create thumbnail
      try {
        const thumbnailUrl = `https://duette.s3.us-east-2.amazonaws.com/${croppedVidId}thumbnail`;
        const thumbnail = await FileSystem.downloadAsync(
          thumbnailUrl,
          FileSystem.documentDirectory + `${croppedVidId}thumbnail.jpg`
        )
        console.log('Finished downloading vid to ', thumbnail.uri);
        // const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, { time: 5000 });
        // console.log('thumbnail: ', thumbnail)
        // const thumbnailUri = thumbnail.uri;
        try {
          // post to localDB
          const videoRecord = (await axios.post('https://duette.herokuapp.com/api/video', { id: croppedVidId, title, composer, key: songKey, performer, thumbnailUri: thumbnail.uri, videoUri: uri })).data
          console.log('videoRecord: ', videoRecord);
          props.fetchVideos();
          setSuccess(true);
          setSaving(false);
          // setShowDetailsModal(false);
        } catch (e) {
          console.log('error creating new video record: ', e)
        }
      } catch (e) {
        console.log('error getting thumbnail: ', e)
      }
    } catch (e) {
      console.log('error downloading from s3: ', e)
    }
  }

  const getJobStatus = async () => {
    // console.log('intervalId in getJobStatus: ', intervalId)
    const status = (await axios.get(`https://duette.herokuapp.com/api/ffmpeg/job/${jobs[0].id}`)).data;
    console.log('status in getJobStatus: ', status)
    if (status.state !== 'completed') {
      if (status.progress.percent === 20) {
        setInfoGettingInProgress(false);
        setInfoGettingDone(true);
        setCroppingInProgress(true);
      } else if (status.progress.percent === 60) {
        if (!infoGettingDone) {
          setInfoGettingInProgress(false);
          setInfoGettingDone(true);
        }
        setCroppingInProgress(false);
        setCroppingDone(true);
        setSavingInProgress(true);
      } else if (status.progress.percent === 95) {
        if (!croppingDone) {
          setCroppingInProgress(false);
          setCroppingDone(true);
        }
        setSavingInProgress(false);
        setSavingDone(true);
      }
    } else if (status.state === 'failed') {
      // handle failed case
      console.log('job failed')
      clearInterval(intervalId);
    } else {
      // job is completed
      if (!infoGettingDone) setInfoGettingDone(true);
      if (!croppingDone) setCroppingDone(true);
      if (!savingDone) setSavingDone(true);
      console.log('job completed!')
      clearInterval(intervalId)
      console.log('interval cleared');
      download();
    }
  }

  const poll = interval => {
    intervalId = setInterval(getJobStatus, interval);
  }

  const handlePost = async () => {
    const tempVidId = uuid.v4();
    let uriParts = dataUri.split('.');
    let fileType = uriParts[uriParts.length - 1];
    const vidFile = {
      uri: dataUri,
      name: `${tempVidId}.mov`,
      type: `video/${fileType}`
    }
    try {
      const signedUrl = (await axios.get(`https://duette.herokuapp.com/api/aws/getSignedUrl/${tempVidId}`)).data;

      const awsOptions = {
        method: 'PUT',
        body: vidFile,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'video/mov',
        },
      };
      await fetch(signedUrl, awsOptions);
      console.log('posted to s3!')
      croppedVidId = uuid.v4();
      const job = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/job/accompaniment/${tempVidId}/${croppedVidId}`)).data
      jobs.push(job);
      // const value = formRef.getValue();
      // const { title, composer, key, performer } = formRef.getValue();
      // console.log('value: ', value)
      setInfoGettingInProgress(true);
      poll(500);
    } catch (e) {
      console.log('error in handlePost: ', e)
    }
  }

  const handleSave = () => {
    setSaving(true);
    handlePost();
  }

  const handleRecordAnother = () => {
    setPreview(false);
  }

  const handleExit = () => {
    setRecord(false);
    setPreview(false);
  }

  // console.log('showDetailsModal: ', showDetailsModal)

  console.log('saving? ', saving)
  console.log('hi in details modal')

  return (
    saving ? (
      // <View style={{ flex: 1 }}>
      <CatsGallery
        infoGettingDone={infoGettingDone}
        infoGettingInProgress={infoGettingInProgress}
        croppingDone={croppingDone}
        croppingInProgress={croppingInProgress}
        savingDone={savingDone}
        savingInProgress={savingInProgress}
        setSaving={setSaving}
      />
      // </View>
    ) : (
        success ? (
          <View>
            <Text style={styles.titleTextBlue}>Successfully saved!</Text>
            <Image style={styles.successCat} source={require('../assets/images/happy_grumpy_cat.png')} />
            <Button
              title="Exit"
              onPress={handleExit} />
            <Button
              title="Record another video"
              onPress={handleRecordAnother} />
          </View>
        ) : (
            <View style={styles.container}>
              <Modal
                onRequestClose={handleDetailsExit}
                supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
              >
                {
                  postSuccess ? (
                    <View style={{ paddingTop: 50 }}>
                      <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: '#0047B9' }}>Posted!</Text>
                      <Button
                        title="Record another accompaniment"
                        onPress={handleRecordAnother} />
                      <Button
                        onPress={handleDetailsExit}
                        title="Home" />
                    </View>
                  ) : (
                      <Form
                        handleSave={handleSave}
                        title={title}
                        setTitle={setTitle}
                        composer={composer}
                        setComposer={setComposer}
                        songKey={songKey}
                        setSongKey={setSongKey}
                        performer={performer}
                        setPerformer={setPerformer}
                        setShowDetailsModal={setShowDetailsModal} />
                    )
                }
              </Modal>
            </View >
          )
      )
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titleTextBlue: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  successCat: {
    margin: 10,
    width: 300,
    height: 285,
    alignSelf: 'center',
    borderColor: 'black',
    borderWidth: 2
  }
});

const mapState = ({ user }) => {
  return {
    user,
  }
}

const mapDispatch = dispatch => {
  return {
    fetchVideos: () => dispatch(fetchVideos()),
  }
}

export default connect(mapState, mapDispatch)(DetailsModal);

// export default withRouter(DetailsModal);
