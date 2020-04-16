/* eslint-disable max-statements */
/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
// import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux';
import { View, Modal, Button, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';
import { ScreenOrientation } from 'expo';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import PreviewModal from './PreviewModal';

const RecordDuetteModal = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  // console.log('width: ', screenWidth, 'height: ', screenHeight)

  // pass in props on HomeScreen component
  const { showRecordDuetteModal, setShowRecordDuetteModal, bluetooth } = props;

  const [recording, setRecording] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [duetteUri, setDuetteUri] = useState('');
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');
  const [vidRef, setVidRef] = useState(null);
  const [vidLoaded, setVidLoaded] = useState(false);
  const [vidDoneBuffering, setVidDoneBuffering] = useState(false);
  const [startPlaying, setStartPlaying] = useState(false);
  const [vidIsPlaying, setVidIsPlaying] = useState(false);

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

  // TODO: user should not be able to record video until accompaniment video has been loaded (see https://docs.expo.io/versions/latest/sdk/av/) 

  // When video has loaded...
  // when user presses record button:
  // 1. video starts playing
  // 2. playbackObject event is fired, 'isPlaying' is true (either store on state or proceed to #3)
  // 3. when 'isPLaying' is true, recording starts

  const handleExit = () => {
    console.log('modal exited!')
  }

  const toggleRecord = async () => {
    if (recording) {
      setRecording(false);
      cameraRef.stopRecording();
      console.log('recording stopped')
    } else {
      setRecording(true);
      // setStartPlaying(true);
      // await vidRef.stopAsync();
      try {
        console.log('in startRecording')
        // FIXME: need to mirror video
        const vid = await cameraRef.recordAsync();
        console.log('recording finished! video uri: ', vid.uri)
        setDuetteUri(vid.uri);
        setRecordingFinished(true);
        setShowPreviewModal(true);
      } catch (e) {
        console.log('error recording: ', e)
      }
    }
  }

  const playVid = async () => {
    await vidRef.playAsync();
    setVidIsPlaying(true);
  }
  if (recording && !vidIsPlaying) playVid();

  console.log('recording? ', recording)
  console.log('vidIsPlaying? ', vidIsPlaying)

  // const togglePreviewOrBack = () => {
  //   if (recordingFinished) {
  //     setShowRecordDuetteModal(false);
  //     setShowPreviewModal(true);
  //   } else {
  //     setShowRecordDuetteModal(false);
  //   }
  // }

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  }

  const handleRecordExit = () => {
    if (!recording) setShowRecordDuetteModal(false);
  }

  const handleCancel = () => {
    vidRef.unloadAsync()
      .then(() => {
        console.log('successfully unloaded video')
        props.selectedVideo.videoUri = '';
        setShowRecordDuetteModal(false);
        // setVidLoaded(false);
        // setUriAvailable(false);
      })
      .catch((e) => {
        console.log('error unloading video: ', e)
        props.selectedVideo.videoUri = '';
        setShowRecordDuetteModal(false);
        // setVidLoaded(false);
        // setUriAvailable(false);
      })
  }

  const handlePlaybackStatusUpdate = (updateObj) => {
    // console.log('updateObj: ', updateObj)
    if (updateObj.didJustFinish) console.log('did just finish')
    if (updateObj.hasJustBeenInterrupted) console.log('was interrupted')
    // if (updateObj.isPlaying) console.log('video is playing!')
    if (updateObj.isLoaded !== vidLoaded) setVidLoaded(updateObj.isLoaded);
    if (updateObj.isBuffering === vidDoneBuffering) setVidDoneBuffering(!updateObj.isBuffering);
  }

  // console.log('showPreviewModal: ', showPreviewModal)

  // console.log('recording? ', recording)

  // console.log('duetteUri: ', duetteUri)

  // console.log('screenWidth: ', screenWidth, 'screenHeight: ', screenHeight)

  // console.log('selectedVideo: ', props.selectedVideo)

  // console.log('screen orientation in Duette Modal: ', screenOrientation)

  console.log('vidLoaded: ', vidLoaded);
  console.log('vidDoneBuffering: ', vidDoneBuffering);

  // console.log('bluetooth? ', bluetooth)

  return (
    <View style={styles.container}>
      {
        showPreviewModal ? (
          <PreviewModal handleCancel={handleCancel} bluetooth={bluetooth} showRecordDuetteModal={showRecordDuetteModal} setShowRecordDuetteModal={setShowRecordDuetteModal} duetteUri={duetteUri} showPreviewModal={showPreviewModal} setShowPreviewModal={setShowPreviewModal} />
        ) : (
            <Modal
              onRequestClose={handleExit}
              supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
              onOrientationChange={e => handleModalOrientationChange(e)}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'black',
                paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
                height: '100%'
              }}>
                {/* FIXME: the very first time a video plays after the app is loaded, it doesn't actually play */}
                <Video
                  ref={ref => setVidRef(ref)}
                  source={{ uri: props.selectedVideo.videoUri }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  // shouldPlay={true}
                  positionMillis={0}
                  progressUpdateIntervalMillis={50}
                  onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
                  isLooping={false}
                  style={{ width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}
                />
                {/* TODO: add codec to camera input? (e.g. .mov) */}
                <Camera
                  style={{ width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}
                  type={Camera.Constants.Type.front}
                  ref={ref => setCameraRef(ref)}>
                  <View>
                    <TouchableOpacity
                      onPress={recording ? handleRecordExit : handleCancel}
                    >
                      <Text style={{
                        color: 'red',
                        fontSize: screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 22,
                        paddingLeft: 20,
                        paddingTop: 20,
                        fontWeight: 'normal'
                      }}
                      >
                        {recording ? 'Recording' : 'Cancel'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={toggleRecord}
                      style={{
                        borderWidth: screenWidth / 100,
                        borderColor: recording ? 'darkred' : 'darkred',
                        alignSelf: 'flex-end',
                        width: screenWidth / 10,
                        height: screenWidth / 10,
                        backgroundColor: recording ? 'black' : 'red',
                        borderRadius: 50,
                        margin: 10,
                      }}
                    />
                  </View>
                </Camera>
              </View>
            </Modal >
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
  overlay: {
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: "#DDDDDD",
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderColor: 'black',
  }
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteModal);

            // export default withRouter(RecordDuetteModal);
