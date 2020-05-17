/* eslint-disable max-statements */
/* eslint-disable complexity */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Alert, Image, View, Modal, Button, StyleSheet, Text, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import uuid from 'react-native-uuid';
import DisplayMergedVideo from './DisplayMergedVideo';
import CatsGallery from './CatsGallery';
import { getAWSVideoUrl } from '../constants/urls';
import ErrorView from './Error';
import PreviewAndSync from './PreviewAndSync';
import { postDuette } from '../redux/duettes';

let date1;
let date2;

const ReviewDuette = (props) => {

  const {
    bluetooth,
    duetteUri,
    setShowPreviewModal,
    setShowRecordDuetteModal,
    screenOrientation,
    playDelay,
  } = props;

  const [displayMergedVideo, setDisplayMergedVideo] = useState(false);
  const [success, setSuccess] = useState(false);
  // const [screenOrientation, setScreenOrientation] = useState('')
  const [previewComplete, setPreviewComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vidARef, setVidARef] = useState(null);
  const [vidBRef, setVidBRef] = useState(null);
  const [vid1Ready, setVid1Ready] = useState(false);
  const [vid2Ready, setVid2Ready] = useState(false);
  const [bothVidsReady, setBothVidsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customOffset, setCustomOffset] = useState(bluetooth ? 200 : 0);
  const [infoGettingDone, setInfoGettingDone] = useState(false);
  const [croppingDone, setCroppingDone] = useState(false);
  const [savingDone, setSavingDone] = useState(false);
  const [error, setError] = useState(false);
  const [combinedKey, setCombinedKey] = useState('');
  const [savingToCameraRoll, setSavingToCameraRoll] = useState(false);
  // const [date1, setDate1] = useState(0);
  // const [date2, setDate2] = useState(0);
  // const [latency, setLatency] = useState(0);

  let intervalId;
  let tempVidId;

  // let startTime;

  const jobs = [];

  console.log("playDelay: ", playDelay);

  const handleSave = () => {
    setSaving(true);
    handlePost();
  };

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
    }
    if (status.state === 'failed') {
      clearInterval(intervalId);
      setError(true);
      throw new Error(`job #${jobs[0].id} failed: `, status.reason);
    }
    if (status.state === 'completed') {
      if (!infoGettingDone) setInfoGettingDone(true);
      if (!croppingDone) setCroppingDone(true);
      if (!savingDone) setSavingDone(true);
      clearInterval(intervalId)
      // console.log('speed: ', Date.now() - startTime)
      try {
        props.postDuette({ id: tempVidId, userId: props.user.id, videoId: props.selectedVideo.id });
        await axios.delete(`https://duette.herokuapp.com/api/aws/${tempVidId}`);
        setSuccess(true);
        setSaving(false);
      } catch (e) {
        setError(true);
        throw new Error('error downloading from s3: ', e);
      }
    }
  };

  const poll = interval => {
    intervalId = setInterval(getJobStatus, interval);
  };

  const handlePost = async () => {
    // startTime = Date.now();
    const id = uuid.v4();
    tempVidId = id;
    let uriParts = duetteUri.split('.');
    let fileType = uriParts[uriParts.length - 1];
    const file = {
      uri: duetteUri,
      name: `${tempVidId}.mov`,
      type: `video/${fileType}`
    }

    try {
      const signedUrl = (await axios.get(`https://duette.herokuapp.com/api/aws/getSignedUrl/${tempVidId}.mov`)).data;
      const options = {
        method: 'PUT',
        body: file,
        headers: {
          Accept: 'application/json',
          'Content-Type': `video/${fileType}`,
        },
      };

      try {
        await fetch(signedUrl, options);
        const duetteKey = tempVidId;
        const accompanimentKey = props.selectedVideo.id;
        const combinedVidKey = `${accompanimentKey}${duetteKey}`;
        try {
          // console.log('latency line 134: ', latency)
          // console.log('Date2 - Date1: ', date2 - date1);
          // console.log('extraDelay: ', date2 - date1)
          const job = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/job/duette/${duetteKey}/${accompanimentKey}/${(customOffset + playDelay + (date2 - date1)) / 1000}`, { userName: props.user.name.split(' ')[0], userEmail: props.user.email })).data;
          jobs.push(job);
          setCombinedKey(combinedVidKey);
          poll(500);
        } catch (e) {
          setError(true);
          throw new Error('error posting job: ', e);
        }
      }
      catch (e) {
        setError(true);
        throw new Error('error posting to s3: ', e);
      }
    } catch (e) {
      setError(true);
      throw new Error('error getting signedUrl: ', e);
    }
  };

  // const handleModalOrientationChange = (ev) => {
  //   setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  // };

  const handleView = () => {
    setDisplayMergedVideo(true);
  };

  // console.log('date1: ', date1)
  // console.log('date2: ', date2)

  const handleShowPreview = async () => {
    setPreviewComplete(false);
    // date1 = Date.now();
    await vidBRef.playFromPositionAsync(customOffset + playDelay, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    // date2 = Date.now();
    // console.log("date2 - date1: ", date2 - date1);
    // setLatency(date2 - date1);
    // console.log('vidB started playing: ', Date.now());
    date1 = Date.now();
    // setDate1(Date.now());
    await vidARef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    // console.log('vidA started playig: ', Date.now());
    // setDate2(Date.now());
    date2 = Date.now();
    setIsPlaying(true);
  };

  const handleRedo = () => {
    setShowPreviewModal(false);
  };

  const handleGoHome = () => {
    setSavingToCameraRoll(false);
    setShowPreviewModal(false);
    setShowRecordDuetteModal(false);
  };

  const saveVideo = async () => {
    setSavingToCameraRoll(true);
    try {
      const { uri } = await FileSystem.downloadAsync(
        getAWSVideoUrl(combinedKey),
        FileSystem.documentDirectory + `${combinedKey}.mov`
      )
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert(
          'Saved',
          'Your video has been saved to your Camera Roll!',
          [
            { text: 'Home', onPress: () => handleGoHome() },
          ],
          { cancelable: false }
        );
      } catch (e) {
        setError(true);
        throw new Error('error saving to camera roll: ', e);
      }
    } catch (e) {
      setError(true);
      throw new Error('error downloading to local file: ', e);
    }
  };

  const handleSaveToCameraRoll = async () => {
    const permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status !== 'granted') {
      const newPermission = await MediaLibrary.requestPermissionsAsync();
      if (newPermission.status === 'granted') {
        saveVideo();
      } else {
        Alert.alert(
          'Camera Roll',
          'We need your permission to save to your Camera Roll!',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        );
      }
    } else {
      saveVideo();
    }
  };

  const handlePlaybackStatusUpdate = (updateObj, whichVid) => {
    if (whichVid === 'vid1') {
      if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid1Ready(true)
      } else if (!vid1Ready && vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid1Ready(true);
        setBothVidsReady(true);
      } else if (updateObj.didJustFinish) {
        setPreviewComplete(true);
        setIsPlaying(false);
      }
    } else if (whichVid === 'vid2') {
      if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid2Ready(true)
      } else if (vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setBothVidsReady(true);
      } else if (updateObj.didJustFinish) {
        setPreviewComplete(true);
        setIsPlaying(false);
      }
    }
  };

  const handleSyncBack = async () => {
    if (customOffset < (50 - playDelay)) return;
    await vidARef.stopAsync();
    await vidBRef.stopAsync();

    setCustomOffset(customOffset - 50);
    await vidBRef.playFromPositionAsync(customOffset + playDelay - 50, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    // console.log('Date.now line 265: ', Date.now())
    // setDate1(Date.now());
    date1 = Date.now();
    await vidARef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    // console.log('Date.now line 267: ', Date.now())
    // setDate2(Date.now());
    date2 = Date.now();
  };

  const handleSyncForward = async () => {
    await vidARef.stopAsync();
    await vidBRef.stopAsync();
    setCustomOffset(customOffset + 50);
    await vidBRef.playFromPositionAsync(customOffset + playDelay + 50, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    // setDate1(Date.now());
    date1 = Date.now();
    await vidARef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    // console.log('Date.now line 277: ', Date.now())
    date2 = Date.now();
    // setDate2(Date.now());
  };

  const handleError = () => {
    setDisplayMergedVideo(false);
    setPreviewComplete(false);
    setSaving(false);
    setInfoGettingDone(false);
    setCroppingDone(false);
    setSavingDone(false);
    setError(false);
  };

  console.log('customOffset: ', customOffset)

  return (
    error ? (
      <ErrorView handleGoBack={handleError} />
    ) : (
        <View style={styles.container}>
          {
            displayMergedVideo ? (
              <DisplayMergedVideo
                combinedKey={combinedKey}
                savingToCameraRoll={savingToCameraRoll}
                handleSaveToCameraRoll={handleSaveToCameraRoll}
                handleRedo={handleRedo}
              />
            ) : (
                <Modal
                  supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                // onOrientationChange={e => handleModalOrientationChange(e)}
                >{
                    saving ? (
                      <CatsGallery
                        infoGettingDone={infoGettingDone}
                        croppingDone={croppingDone}
                        savingDone={savingDone}
                        addPadding={10}
                        type="duette"
                      />
                    ) : (
                        success ? (
                          // video has been merged
                          <View style={styles.saveContainer}>
                            <Text style={styles.savingHeader}>Video saved!</Text>
                            <Image source={{ uri: 'https://media.giphy.com/media/13OyGVcay7aWUE/giphy.gif' }} style={{ width: 300, height: 200, marginTop: 20, marginBottom: 20 }} />
                            <Button
                              title="View Video"
                              onPress={handleView}
                            />
                            <Button
                              disabled={savingToCameraRoll}
                              title={savingToCameraRoll ? 'Saving to Camera Roll...' : 'Save to Camera Roll'}
                              onPress={handleSaveToCameraRoll}
                            />
                            {
                              savingToCameraRoll &&
                              <ActivityIndicator size="small" color="#0047B9" />
                            }
                          </View>
                        ) : (
                            // video hasn't been merged yet
                            <PreviewAndSync
                              screenOrientation={screenOrientation}
                              setVidARef={setVidARef}
                              setVidBRef={setVidBRef}
                              handlePlaybackStatusUpdate={handlePlaybackStatusUpdate}
                              duetteUri={duetteUri}
                              bluetooth={bluetooth}
                              handleShowPreview={handleShowPreview}
                              previewComplete={previewComplete}
                              isPlaying={isPlaying}
                              bothVidsReady={bothVidsReady}
                              handleSave={handleSave}
                              handleRedo={handleRedo}
                              handleSyncBack={handleSyncBack}
                              handleSyncForward={handleSyncForward}
                            />
                          )
                      )
                  }
                </Modal>
              )
          }
        </View >
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
  saveContainer: {
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingHeader: {
    fontSize: 40,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#0047B9'
  },
});

const mapState = ({ selectedVideo, user }) => {
  return {
    selectedVideo,
    user,
  }
};

const mapDispatch = dispatch => {
  return {
    postDuette: details => dispatch(postDuette(details)),
  }
}

export default connect(mapState, mapDispatch)(ReviewDuette);
