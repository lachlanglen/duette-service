/* eslint-disable max-statements */
/* eslint-disable react/self-closing-comp */
/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Alert, Image, View, Modal, Button, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements'
import { Video } from 'expo-av';
// import { ScreenOrientation } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
// import Constants from 'expo-constants';
// import { RNS3 } from 'react-native-s3-upload';
import axios from 'axios';
import uuid from 'react-native-uuid';
// import DisplayMergedVideo from './DisplayMergedVideo';
import CatsGallery from './CatsGallery';
import { getAWSVideoUrl } from '../constants/urls';
import Error from './Error';

// const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_BUCKET_REGION } = Constants.manifest.extra;

const PreviewModal = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const { handleCancel, bluetooth, duetteUri, showPreviewModal, setShowPreviewModal, showRecordDuetteModal, setShowRecordDuetteModal } = props;

  const [displayMergedVideo, setDisplayMergedVideo] = useState(false);
  const [success, setSuccess] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('')
  const [previewSelected, setPreviewSelected] = useState(false);
  const [previewComplete, setPreviewComplete] = useState(false);
  const [rewatch, setRewatch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vidARef, setVidARef] = useState(null);
  const [vidBRef, setVidBRef] = useState(null);
  const [vid1Ready, setVid1Ready] = useState(false);
  const [vid2Ready, setVid2Ready] = useState(false);
  const [bothVidsReady, setBothVidsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [delay, setDelay] = useState(0);
  // const [customOffset, setCustomOffset] = useState(0);
  const [infoGettingInProgress, setInfoGettingInProgress] = useState(false);
  const [infoGettingDone, setInfoGettingDone] = useState(false);
  const [croppingInProgress, setCroppingInProgress] = useState(false);
  const [croppingDone, setCroppingDone] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [savingDone, setSavingDone] = useState(false);
  const [error, setError] = useState(false);

  let intervalId;
  let combinedKey;
  let tempVidId;

  // const minVal = -250;
  // const maxVal = 250;

  const jobs = [];

  useEffect(() => {
    detectOrientation();
  }, [])

  const detectOrientation = async () => {
    const { orientation } = await ScreenOrientation.getOrientationAsync();
    setScreenOrientation(orientation.split('_')[0])
    ScreenOrientation.addOrientationChangeListener(info => {
      if (info.orientationInfo.orientation === 'UNKNOWN') {
        if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE')
        if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT')
      } else {
        setScreenOrientation(info.orientationInfo.orientation);
      }
    })
  }

  const handleExit = () => {
    console.log('preview modal exited')
  }

  const handleSave = () => {
    setSaving(true);
    handlePost();
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
      // TODO: handle failed case
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
      console.log('interval cleared');
      try {
        const newDuetteInDB = await axios.post('https://duette.herokuapp.com/api/duette', { id: combinedKey, userId: props.user.id });
        console.log('duette: ', newDuetteInDB.data)
        await axios.delete(`https://duette.herokuapp.com/api/aws/${tempVidId}`);
        console.log('temp video deleted!');
        setSuccess(true);
        setSaving(false);
      } catch (e) {
        console.log('error downloading from s3: ', e);
        setError(true);
      }
    }
  }

  const poll = interval => {
    intervalId = setInterval(getJobStatus, interval);
  }

  const handlePost = async () => {
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
      const signedUrl = (await axios.get(`https://duette.herokuapp.com/api/aws/getSignedUrl/${id}`)).data;

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
        console.log('posted to s3!')
        const duetteKey = tempVidId;
        const accompanimentKey = props.selectedVideo.id;
        const combinedVidKey = `${accompanimentKey}${duetteKey}`;
        try {
          const job = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/job/duette/${duetteKey}/${accompanimentKey}/${bluetooth ? (delay + 200) / 1000 : delay / 1000}`)).data;
          jobs.push(job);
          // save combinedKey
          combinedKey = combinedVidKey;
          setInfoGettingInProgress(true);
          poll(500);
        } catch (e) {
          console.log('error posting job: ', e);
          setError(true);
        }
      }
      catch (e) {
        console.log('error posting to s3: ', e);
        setError(true);
      }
    } catch (e) {
      console.log('error getting signedUrl: ', e);
      setError(true);
    }
  }

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  }

  // const handleBack = () => {
  //   setShowPreviewModal(false)
  //   // FileSystem.downloadAsync(
  //   //   'https://duette.s3.us-east-2.amazonaws.com/98462f9c-e359-4904-9c50-df6dc8d31a4b',
  //   //   FileSystem.documentDirectory + `98462f9c-e359-4904-9c50-df6dc8d31a4b.mp4`
  //   // )
  //   //   .then(({ uri }) => {
  //   //     console.log('Finished downloading to ', uri);
  //   //     setMergedLocalUri(uri);
  //   //     setSuccess(true);
  //   //   })
  //   //   .catch(error => {
  //   //     console.error(error);
  //   //   });
  // }

  const handleView = () => {
    // setShowPreviewModal(false);
    setDisplayMergedVideo(true);
  }

  const handleShowPreview = async () => {
    setPreviewComplete(false);
    setPreviewSelected(true);
    console.log('delay in handleShowPreview: ', delay)
    await vidARef.playFromPositionAsync(0);
    await vidBRef.playFromPositionAsync(bluetooth ? bluetooth + delay : delay);
    setIsPlaying(true);
  }

  // FIXME: rewatch not functional
  const handleRewatch = () => {
    setRewatch(true);
    setPreviewComplete(false);
  }

  const handleRedo = () => {
    setShowPreviewModal(false);
  }

  const handleGoHome = () => {
    setShowPreviewModal(false);
    setShowRecordDuetteModal(false);
  }

  const saveVideo = async () => {
    try {
      const { uri } = await FileSystem.downloadAsync(
        getAWSVideoUrl(combinedKey),
        FileSystem.documentDirectory + `${combinedKey}.mov`
      )
      console.log('Finished downloading to ', uri);
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        console.log('saved to library!')
        Alert.alert(
          'Saved',
          'Your video has been saved to your Camera Roll!',
          [
            { text: 'Home', onPress: () => handleGoHome() },
          ],
          { cancelable: false }
        )
      } catch (e) {
        console.log('error saving to camera roll: ', e);
        setError(true);
      }
    } catch (e) {
      console.log('error downloading to local file: ', e);
      setError(true);
    }
  }

  const handleSaveToCameraRoll = async () => {
    const permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status !== 'granted') {
      const newPermission = await MediaLibrary.requestPermissionsAsync();
      if (newPermission.status === 'granted') {
        // TODO: set a loading view
        saveVideo();
      } else {
        // TODO: notify user that they have to allow permissions to access video
      }
    } else {
      saveVideo();
    }
  }

  // console.log('vid1Ready: ', vid1Ready)
  // console.log('vid2Ready: ', vid1Ready)
  // console.log('bothVidsReady: ', bothVidsReady)

  const handlePlaybackStatusUpdateVid1 = (updateObj) => {
    // console.log('vid1 updateObj: ', updateObj)
    if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
      console.log('line 295')
      setVid1Ready(true)
    } else if (!vid1Ready && vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
      console.log('line 298')
      setBothVidsReady(true);
    } if (updateObj.didJustFinish) {
      console.log('line 301')
      setPreviewComplete(true);
      setIsPlaying(false);
    }
  }

  const handlePlaybackStatusUpdateVid2 = (updateObj) => {
    // console.log('vid2 updateObj: ', updateObj)
    if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
      console.log('line 309')
      setVid2Ready(true)
    } else if (vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
      console.log('line 312')
      setBothVidsReady(true);
    }
  }

  const handleSyncBack = async () => {
    await vidARef.stopAsync();
    await vidBRef.stopAsync();
    setDelay(delay - 50);
  }

  const syncBack = async () => {
    await handleSyncBack();
    handleShowPreview();
  }

  const handleSyncForward = async () => {
    // stop videos
    await vidARef.stopAsync();
    await vidBRef.stopAsync();
    // update delay (minus 5ms)
    setDelay(delay + 50);
    // start playing videos again, with vidB set to delay + bluetooth
    // handleShowPreview();
  }

  const syncForward = async () => {
    await handleSyncForward();
    handleShowPreview();
  };

  const handleError = () => {
    setDisplayMergedVideo(false);
    setSuccess(false);
    setPreviewSelected(false);
    setPreviewComplete(false);
    setSaving(false);
    setInfoGettingInProgress(false);
    setInfoGettingDone(false);
    setCroppingInProgress(false);
    setCroppingDone(false);
    setSavingInProgress(false);
    setSavingDone(false);
  }

  // const handleSyncForward = async () => {
  //   await vidARef.pauseAsync();
  //   await vidBRef.pauseAsync();
  //   const vidAObj = await vidARef.getStatusAsync();
  //   const vidACurPos = vidAObj.positionMillis;
  //   console.log('vidA currentPos in syncForward: ', vidACurPos)
  //   const vidBObj = await vidBRef.getStatusAsync();
  //   const vidBCurPos = vidBObj.positionMillis;
  //   console.log('vidB currentPos in syncForward: ', vidBCurPos)
  //   await vidBRef.playFromPositionAsync(vidBCurPos + 5);
  //   await vidARef.playFromPositionAsync(vidACurPos);
  // }

  // console.log('screenOrientation in PreviewModal: ', screenOrientation)
  // console.log('previewSelected: ', previewSelected)
  // console.log('previewComplete: ', previewComplete);

  // console.log('mergedLocalUri: ', mergedLocalUri)

  console.log('duetteUri: ', duetteUri)

  // console.log('vidARef: ', vidARef);
  // console.log('vidBRef: ', vidBRef);

  return (
    error ? (
      <Error handleGoBack={handleError} />
    ) : (
        <View style={styles.container}>
          {
            displayMergedVideo ? (
              // <DisplayMergedVideo
              //   mergedLocalUri={mergedLocalUri}
              //   displayMergedVideo={displayMergedVideo}
              //   setDisplayMergedVideo={setDisplayMergedVideo}
              // />
              <Modal
                onRequestClose={handleExit}
                supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                onOrientationChange={e => handleModalOrientationChange(e)}>
                <View>
                  <Video
                    source={{ uri: getAWSVideoUrl(combinedKey) }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    isLooping={false}
                    useNativeControls={true}
                    // style={{ width: 100, height: 100 }}
                    style={{
                      width: screenWidth,
                      height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                      marginBottom: 15,
                      // marginTop: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
                    }}
                  >
                    {/* <View
                  style={{
                    width: screenWidth,
                    height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    flexDirection: 'column',
                    // paddingRight: 5,
                    // paddingBottom: 5
                  }}>
                  <TouchableOpacity style={{
                    backgroundColor: 'black',
                    width: screenWidth * 0.5,

                  }}>
                    <TouchableOpacity style={{ marginTop: 12, marginBottom: 6 }}>
                      <Text style={styles.overlayText}>Save to Camera Roll</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: 6, marginBottom: 12 }}>
                      <Text style={styles.overlayText}>Re-Record</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View> */}
                  </Video>
                  <Button
                    style={{ marginTop: 30 }}
                    title="Save to Camera Roll"
                    onPress={handleSaveToCameraRoll} />
                  <Button
                    title="Re-Record"
                    onPress={handleRedo} />
                </View>
              </Modal>
            ) : (
                <Modal
                  onRequestClose={handleExit}
                  supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                  onOrientationChange={e => handleModalOrientationChange(e)}
                >{
                    saving ? (
                      <CatsGallery
                        infoGettingDone={infoGettingDone}
                        infoGettingInProgress={infoGettingInProgress}
                        croppingDone={croppingDone}
                        croppingInProgress={croppingInProgress}
                        savingDone={savingDone}
                        savingInProgress={savingInProgress}
                        setSaving={setSaving}
                      />
                    ) : (
                        success ? (
                          // video has been merged
                          <View style={styles.saveContainer}>
                            <Text style={styles.savingHeader}>Video saved!</Text>
                            <Image source={{ uri: 'https://media.giphy.com/media/13OyGVcay7aWUE/giphy.gif' }} style={{ width: 300, height: 200, marginTop: 20, marginBottom: 20 }} />
                            <Button
                              // style={styles.savingButton}
                              title="View Video"
                              onPress={handleView}>
                            </Button>
                            <Button
                              // style={styles.savingButton}
                              title="Save to Camera Roll"
                              onPress={handleSaveToCameraRoll}>
                            </Button>
                          </View>
                        ) : (
                            // video hasn't been merged yet
                            // <View>
                            <View style={{
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
                              backgroundColor: 'black',
                              height: '100%'
                            }}>
                              <View style={{ flexDirection: 'row' }}>
                                <Video
                                  ref={ref => setVidARef(ref)}
                                  source={{ uri: getAWSVideoUrl(props.selectedVideo.id) }}
                                  rate={1.0}
                                  volume={1.0}
                                  isMuted={false}
                                  resizeMode="cover"
                                  positionMillis={0}
                                  isLooping={false}
                                  style={{ width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}
                                  onPlaybackStatusUpdate={update => handlePlaybackStatusUpdateVid1(update)}
                                />
                                <Video
                                  ref={ref => setVidBRef(ref)}
                                  source={{ uri: duetteUri }}
                                  rate={1.0}
                                  volume={1.0}
                                  isMuted={false}
                                  resizeMode="cover"
                                  positionMillis={bluetooth ? 200 : 0}
                                  isLooping={false}
                                  style={{ width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}
                                  onPlaybackStatusUpdate={update => handlePlaybackStatusUpdateVid2(update)}
                                />
                                {
                                  // if preview hasn't played yet (!previewSelected)
                                  // previewSelected &&
                                  !previewComplete && !isPlaying ? (
                                    <TouchableOpacity
                                      onPress={handleShowPreview}
                                      style={{ ...styles.overlay, width: screenWidth, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}>
                                      <Text style={{
                                        fontSize: screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 20,
                                        fontWeight: 'bold'
                                      }}>{bothVidsReady ? 'Touch to preview!' : 'Loading...'}</Text>
                                    </TouchableOpacity>
                                  ) : (
                                      // if preview has played (previewComplete)
                                      previewComplete &&
                                      <TouchableOpacity
                                        style={{ ...styles.overlay, opacity: 0.8, flexDirection: 'row', width: screenWidth, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}>
                                        <TouchableOpacity
                                          style={styles.button}
                                          onPress={handleSave}>
                                          <Text
                                            style={styles.overlayText}>
                                            Save
                                          </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          style={styles.button}
                                          onPress={handleRedo}>
                                          <Text
                                            style={styles.overlayText}>
                                            Redo
                                          </Text>
                                        </TouchableOpacity>
                                      </TouchableOpacity>
                                    )
                                }
                              </View>
                              {/* {
                                screenOrientation === 'PORTRAIT' &&
                                <TouchableOpacity
                                // style={{ backgroundColor: 'white' }}
                                // onPress={handleCancel}
                                >
                                  <Text style={{ color: 'white', marginTop: 20, marginVertical: 20, textAlign: 'center' }}>Not perfectly in sync? Use the arrows below to adjust to your taste!</Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon
                                      onPress={syncBack}
                                      name="fast-rewind"
                                      type="material"
                                      color="white"
                                      size={60} />
                                    <Text
                                      style={{
                                        fontSize: 30,
                                        color: 'white',
                                        alignSelf: 'center'
                                      }}>{delay >= 0 && '+'} {delay} ms
                                </Text>
                                    <Icon
                                      onPress={syncForward}
                                      name="fast-forward"
                                      type="material"
                                      color="white"
                                      size={60} />
                                  </View>
                                  <Text style={{ fontStyle: 'italic', marginTop: 30, color: 'white', textAlign: 'center' }}>Hint:</Text>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'white' }}>If your video is <Text style={{ color: 'yellow' }}>behind</Text> the accompaniment, press </Text><Icon name="fast-forward"
                                      type="material"
                                      color="yellow" />
                                  </View>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'white' }}>If your video is <Text style={{ color: 'yellow' }}>ahead of</Text> the accompaniment, press </Text><Icon name="fast-rewind"
                                      type="material"
                                      color="yellow" />
                                  </View>
                                </TouchableOpacity>
                              } */}
                            </View>
                            // {
                            //   screenOrientation === 'PORTRAIT' &&
                            //   <View style={{ backgroundColor: 'pink' }}>
                            //     <TouchableOpacity
                            //       style={styles.button}
                            //       onPress={handleSave}>
                            //       <Text
                            //         style={styles.overlayText}>
                            //         Save
                            //             </Text>
                            //     </TouchableOpacity>
                            //     <TouchableOpacity
                            //       style={styles.button}
                            //       onPress={handleRedo}>
                            //       <Text
                            //         style={styles.overlayText}>
                            //         Redo
                            //             </Text>
                            //     </TouchableOpacity>
                            //   </View>
                            // }
                            /* </View> */
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
  // savingButton: {
  //   margin: 30,
  //   color: 'black'
  // },
  savingHeader: {
    fontSize: 40,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#0047B9'
  },
  savingItem: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0047B9',
    // padding: 30,
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderColor: 'black',
  },
  overlayText: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '600',
    color: 'white',
  },
  button: {
    backgroundColor: "#0047B9",
    opacity: 1,
    alignSelf: 'center',
    borderColor: 'black',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1
  },
});

const mapState = ({ selectedVideo, user }) => {
  return {
    selectedVideo,
    user,
  }
}

export default connect(mapState)(PreviewModal);

                  // export default withRouter(PreviewModal);
