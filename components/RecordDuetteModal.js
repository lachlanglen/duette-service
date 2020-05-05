/* eslint-disable max-statements */
/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';
// import { ScreenOrientation } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
import PreviewDuette from './PreviewDuette';
import { getAWSVideoUrl } from '../constants/urls';
import Error from './Error';

const RecordDuetteModal = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const { showRecordDuetteModal, setShowRecordDuetteModal, bluetooth } = props;

  const [recording, setRecording] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [duetteUri, setDuetteUri] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');
  const [vidRef, setVidRef] = useState(null);
  const [vidLoaded, setVidLoaded] = useState(false);
  const [vidDoneBuffering, setVidDoneBuffering] = useState(false);
  const [error, setError] = useState(false);
  // const [vidIsPlaying, setVidIsPlaying] = useState(false);


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

  const record = async () => {
    console.log('Date.now in record: ', Date.now())
    try {
      const vid = await cameraRef.recordAsync();
      // console.log('vid.uri: ', vid.uri)
      setDuetteUri(vid.uri);
      setShowPreviewModal(true);
    } catch (e) {
      console.log('error starting recording: ', e);
      setError(true);
    }
  }

  const play = async () => {
    console.log('Date.now in play: ', Date.now())
    // cameraRef.stopRecording();
    // console.log('recording stopped');
    try {
      // TODO: add from milliseconds
      await vidRef.playAsync();
      console.log('video playing')
      // const vid = await cameraRef.recordAsync();
      // setDuetteUri(vid.uri);
      // record();
    } catch (e) {
      console.log('error playing or recording: ', e);
      setError(true);
    }
  }

  // console.log('duetteUri: ', duetteUri)

  const toggleRecord = async () => {
    if (recording) {
      setRecording(false);
      cameraRef.stopRecording();
      // setShowPreviewModal(true);
    } else {
      try {
        setRecording(true);
        record();
        play();
        // await vidRef.playAsync();
        // const vid = await cameraRef.recordAsync();
        // setDuetteUri(vid.uri);
        // setShowPreviewModal(true);
      } catch (e) {
        console.log('error recording: ', e)
      }
    }
  }

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  }

  const handleCancel = async () => {
    try {
      await vidRef.unloadAsync();
      cameraRef.stopRecording();
      console.log('successfully unloaded video and stopped recording');
      setShowRecordDuetteModal(false);
    } catch (e) {
      console.log('error unloading video: ', e);
    }
  }

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.isLoaded !== vidLoaded) setVidLoaded(updateObj.isLoaded);
    if (updateObj.isBuffering === vidDoneBuffering) setVidDoneBuffering(!updateObj.isBuffering);
  };

  const handleError = () => {
    setRecording(false);
    setShowPreviewModal(false);
  }

  return (
    error ? (
      <Error handleGoBack={handleError} />
    ) : (
        <View style={styles.container}>
          {
            showPreviewModal ? (
              <PreviewDuette handleCancel={handleCancel} bluetooth={bluetooth} showRecordDuetteModal={showRecordDuetteModal} setShowRecordDuetteModal={setShowRecordDuetteModal} duetteUri={duetteUri} showPreviewModal={showPreviewModal} setShowPreviewModal={setShowPreviewModal} />
            ) : (
                <Modal
                  onRequestClose={handleCancel}
                  supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                  onOrientationChange={e => handleModalOrientationChange(e)}
                >
                  <View style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'black',
                    paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
                    height: '100%'
                  }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Video
                        ref={ref => setVidRef(ref)}
                        source={{ uri: getAWSVideoUrl(props.selectedVideo.id) }}
                        // source={{ uri: 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4' }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="cover"
                        positionMillis={0}
                        progressUpdateIntervalMillis={50}
                        onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
                        // isLooping={false}
                        style={{
                          width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                          height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9
                        }}
                      />
                      {/* TODO: add codec to camera input? (e.g. .mov) */}
                      <Camera
                        style={{ width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}
                        type={Camera.Constants.Type.front}
                        ref={ref => setCameraRef(ref)}>
                        <View>
                          <TouchableOpacity
                            onPress={!recording ? handleCancel : () => { }}
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
                        {
                          vidLoaded && vidDoneBuffering &&
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
                        }
                        {
                          screenOrientation === 'LANDSCAPE' &&
                          <TouchableOpacity
                            onPress={handleCancel}
                            style={{ alignItems: 'center', paddingBottom: 10, height: 30 }}
                          >
                            <Text style={{ color: 'red' }}>Having a problem? Touch here to try again.</Text>
                          </TouchableOpacity>
                        }
                      </Camera>
                    </View>
                    {
                      screenOrientation === 'PORTRAIT' &&
                      <TouchableOpacity
                        onPress={handleCancel}
                      >
                        <Text style={{ color: 'red', marginTop: 20 }}>Having a problem? Touch here to try again.</Text>
                      </TouchableOpacity>
                    }
                  </View>
                </Modal >
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