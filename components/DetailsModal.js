/* eslint-disable complexity */
import React, { useState } from 'react';
import { Image, Text, View, Modal, Button, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import uuid from 'react-native-uuid';
import axios from 'axios';
import CatsGallery from './CatsGallery';
import { postVideo } from '../redux/videos';
import Form from './Form';
import Error from './Error';

const DetailsModal = (props) => {
  const { setRecord, setPreview, setShowDetailsModal, handleDetailsExit, dataUri } = props;

  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [infoGettingDone, setInfoGettingDone] = useState(false);
  const [croppingDone, setCroppingDone] = useState(false);
  const [savingDone, setSavingDone] = useState(false);
  const [error, setError] = useState(false);
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [songKey, setSongKey] = useState('');
  const [performer, setPerformer] = useState(props.user.name);

  const jobs = [];
  let croppedVidId;
  let intervalId;

  const getJobStatus = async () => {
    const status = (await axios.get(`https://duette.herokuapp.com/api/ffmpeg/job/${jobs[0].id}`)).data;
    if (status.state !== 'completed') {
      if (status.progress.percent === 20) {
        setInfoGettingDone(true);
      } else if (status.progress.percent === 60) {
        if (!infoGettingDone) {
          setInfoGettingDone(true);
        }
        setCroppingDone(true);
      } else if (status.progress.percent === 95) {
        if (!croppingDone) {
          setCroppingDone(true);
        }
        setSavingDone(true);
      }
    } else if (status.state === 'failed') {
      console.log('job failed')
      clearInterval(intervalId);
      setError(true);
    } else {
      // job is completed
      if (!infoGettingDone) setInfoGettingDone(true);
      if (!croppingDone) setCroppingDone(true);
      if (!savingDone) setSavingDone(true);
      console.log('job completed!')
      clearInterval(intervalId)
      // post to db
      try {
        props.postVideo({ id: croppedVidId, title, composer, key: songKey, performer, userId: props.user.id });
        setSuccess(true);
        setSaving(false);
      } catch (e) {
        console.log('error posting local video record: ', e);
        setError(true);
      }
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
          'Content-Type': `video/${fileType}`,
        },
      };
      await fetch(signedUrl, awsOptions);
      croppedVidId = uuid.v4();
      const job = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/job/accompaniment/${tempVidId}/${croppedVidId}`)).data
      jobs.push(job);
      poll(500);
    } catch (e) {
      console.log('error in handlePost: ', e);
      setError(true);
    }
  }

  const handleSave = () => {
    setSaving(true);
    handlePost();
  };

  const handleRecordAnother = () => {
    setPreview(false);
  };

  const handleExit = () => {
    setRecord(false);
    setPreview(false);
  };

  const handleError = () => {
    setSaving(false);
    setError(false);
  };

  return (
    error ? (
      <Error handleGoBack={handleError} />
    ) : (
        saving ? (
          <CatsGallery
            infoGettingDone={infoGettingDone}
            croppingDone={croppingDone}
            savingDone={savingDone}
          />
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
                  </Modal>
                </View >
              )
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
    postVideo: details => dispatch(postVideo(details)),
  }
}

export default connect(mapState, mapDispatch)(DetailsModal);
