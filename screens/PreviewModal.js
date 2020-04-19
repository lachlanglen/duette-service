/* eslint-disable max-statements */
/* eslint-disable react/self-closing-comp */
/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Slider, Alert, Image, View, Modal, Button, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements'
import { Video } from 'expo-av';
import { ScreenOrientation } from 'expo';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import uuid from 'react-native-uuid';
import DisplayMergedVideo from './DisplayMergedVideo';
import CatsGallery from './CatsGallery';

const PreviewModal = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const { handleCancel, bluetooth, duetteUri, showPreviewModal, setShowPreviewModal, showRecordDuetteModal, setShowRecordDuetteModal } = props;

  const [displayMergedVideo, setDisplayMergedVideo] = useState(false);
  const [mergedLocalUri, setMergedLocalUri] = useState('');
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
  const [customOffset, setCustomOffset] = useState(0);
  const minVal = -250;
  const maxVal = 250;

  // if (vidARef) {
  //   vidARef.loadAsync({ uri: props.selectedVideo.videoUri })
  //     .then(info => console.log('success loading vidA! ', info))
  //     .catch(e => console.log('error loading vidA: ', e))
  // }

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
    console.log('in handleSave')
    setSaving(true);
    handlePost();
  }

  const handlePost = async () => {
    console.log('in handlePost')
    const fileUris = [props.selectedVideo.videoUri, duetteUri]
    let formData = new FormData();
    // call posting function with each file individually
    fileUris.forEach(uri => {
      const UUID = uuid.v4();
      let uriParts = uri.split('.');
      let fileType = uriParts[uriParts.length - 1];
      formData.append('videos', {
        uri,
        name: UUID,
        type: `video/${fileType}`,
      });
    });
    console.log('formData line 55: ', formData)
    const job = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/job/${bluetooth ? (delay + 200) / 1000 : delay / 1000}`, formData)).data;
    console.log('job id in PreviewModal: ', job.id)

    // TODO: listen for job completion

    // const infoArr = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/duette/getinfo`, formData)).data;
    // console.log('info retrieved: ', infoArr);
    // const croppedPath = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/duette/crop/${bluetooth ? (delay + 200) / 1000 : delay / 1000}`, infoArr)).data;
    // infoArr.push(croppedPath);
    // console.log('cropped! infoArr: ', infoArr);
    // const scaledPath = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/duette/scale`, infoArr)).data;
    // infoArr.push(scaledPath);
    // console.log('scaled! infoArr: ', infoArr);
    // const combinedPath = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/duette/combine`, infoArr)).data;
    // infoArr.push(combinedPath);
    // console.log('combined! infoArr: ', infoArr);
    // const key = (await axios.post(`https://duette.herokuapp.com/api/ffmpeg/duette/aws`, infoArr)).data
    // // add to local DB:
    // console.log('uploaded to AWS and files deleted!');
    // const newDuetteInDB = await axios.post('https://duette.herokuapp.com/api/duette', { id: key });
    // console.log('duette: ', newDuetteInDB.data)

    // retrieve from s3
    const s3Url = `https://duette.s3.us-east-2.amazonaws.com/${key}`;
    FileSystem.downloadAsync(
      s3Url,
      FileSystem.documentDirectory + `${key}.mp4`
    )
      .then(({ uri }) => {
        console.log('Finished downloading to ', uri);
        setMergedLocalUri(uri);
        setSuccess(true);
      })
      .catch(error => {
        console.error(error);
      });
  }

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  }

  const handleBack = () => {
    setShowPreviewModal(false)
    // FileSystem.downloadAsync(
    //   'https://duette.s3.us-east-2.amazonaws.com/98462f9c-e359-4904-9c50-df6dc8d31a4b',
    //   FileSystem.documentDirectory + `98462f9c-e359-4904-9c50-df6dc8d31a4b.mp4`
    // )
    //   .then(({ uri }) => {
    //     console.log('Finished downloading to ', uri);
    //     setMergedLocalUri(uri);
    //     setSuccess(true);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }

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
    await MediaLibrary.saveToLibraryAsync(mergedLocalUri);
    console.log('saved to library!')
    Alert.alert(
      'Saved',
      'Your video has been saved to your Camera Roll!',
      [
        { text: 'OK!', onPress: () => handleGoHome() },
      ],
      { cancelable: false }
    )
  }

  const handleSaveToCameraRoll = async () => {
    const permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status !== 'granted') {
      const newPermission = await MediaLibrary.requestPermissionsAsync();
      if (newPermission.status === 'granted') {
        // TODO: set a loading view
        saveVideo();
      } else {
        // notify client that they have to allow permissions to access video
      }
    } else {
      saveVideo();
    }
  }

  console.log('vid1Ready: ', vid1Ready)
  console.log('vid2Ready: ', vid1Ready)
  console.log('bothVidsReady: ', bothVidsReady)

  const handlePlaybackStatusUpdateVid1 = (updateObj) => {
    if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
      setVid1Ready(true)
    } else if (!vid1Ready && vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
      setBothVidsReady(true);
    } if (updateObj.didJustFinish) {
      setPreviewComplete(true);
      setIsPlaying(false);
    }
  }

  const handlePlaybackStatusUpdateVid2 = (updateObj) => {
    if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
      setVid2Ready(true)
    } else if (vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
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

  console.log('screenOrientation in PreviewModal: ', screenOrientation)
  // console.log('previewSelected: ', previewSelected)
  console.log('previewComplete: ', previewComplete);

  return (
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
                source={{ uri: mergedLocalUri }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                shouldPlay
                isLooping={false}
                useNativeControls={true}
                style={{ width: screenWidth, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}
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
                  <View style={{ padding: 20 }}>
                    <CatsGallery />
                  </View>
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
                              source={{ uri: props.selectedVideo.videoUri }}
                              rate={1.0}
                              volume={1.0}
                              isMuted={false}
                              resizeMode="cover"
                              // positionMillis={0}
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
                              // positionMillis={bluetooth ? 200 : 0}
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
                          {
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
                          }
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

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(PreviewModal);

                  // export default withRouter(PreviewModal);
