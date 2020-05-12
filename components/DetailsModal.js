/* eslint-disable complexity */
import React, { useState } from 'react';
import { Image, Text, View, Modal, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import uuid from 'react-native-uuid';
import axios from 'axios';
import CatsGallery from './CatsGallery';
import { postVideo } from '../redux/videos';
import Form from './Form';
import ErrorView from './Error';
import buttonStyles from '../styles/button';

const DetailsModal = (props) => {
  const {
    setRecord,
    setPreview,
    setShowDetailsModal,
    handleDetailsExit,
    dataUri
  } = props;

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
  let tempVidId;

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
      clearInterval(intervalId);
      setError(true);
      throw new Error(`job #${jobs[0].id} failed: `, status.reason);
    } else {
      // job is completed
      // delete tempVid
      try {
        await axios.delete(`https://duette.herokuapp.com/api/aws/${tempVidId}`)
        if (!infoGettingDone) setInfoGettingDone(true);
        if (!croppingDone) setCroppingDone(true);
        if (!savingDone) setSavingDone(true);
        clearInterval(intervalId)
        props.postVideo({ id: croppedVidId, title, composer, key: songKey, performer, userId: props.user.id });
        // TODO: handle error posting video
        setSuccess(true);
        setSaving(false);
      } catch (e) {
        setError(true);
        throw new Error('error deleting aws temp vid: ', e)
      }
    }
  }

  const poll = interval => {
    intervalId = setInterval(getJobStatus, interval);
  };

  const handlePost = async () => {
    tempVidId = uuid.v4();
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
      setError(true);
      throw new Error('error in handlePost: ', e)
    }
  };

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
      <ErrorView handleGoBack={handleError} />
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
                <TouchableOpacity
                  onPress={handleExit}
                  style={{
                    ...buttonStyles.regularButton,
                    width: '30%',
                    marginTop: 5,
                    marginBottom: 15
                  }}>
                  <Text style={buttonStyles.regularButtonText}>Exit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRecordAnother}
                  style={{
                    ...buttonStyles.regularButton,
                    width: '60%'
                  }}>
                  <Text style={buttonStyles.regularButtonText}>Record another accompaniment</Text>
                </TouchableOpacity>
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
