/* eslint-disable complexity */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Dimensions, Alert } from 'react-native';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';
import ErrorView from '../Error';
import ReviewDuette from '../ReviewDuette';
import { deleteLocalFile } from '../../services/utils';

const RecordDuetteModal = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const {
    setShowRecordDuetteModal,
    bluetooth,
    baseTrackUri,
    setSearchText,
  } = props;

  const [recording, setRecording] = useState(false);
  // const [cameraRef, setCameraRef] = useState(null);
  const [duetteUri, setDuetteUri] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');
  // const [vidRef, setVidRef] = useState(null);
  const [vidLoaded, setVidLoaded] = useState(false);
  const [vidDoneBuffering, setVidDoneBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [playDelay, setPlayDelay] = useState(0);
  const [displayedNotes, setDisplayedNotes] = useState(false);

  const cameraRef = useRef(null);
  const vidRef = useRef(null);

  let time1;
  let time2;
  let time3;

  if (props.selectedVideo.notes && !displayedNotes && vidLoaded && vidDoneBuffering) {
    Alert.alert(
      `Notes from ${props.selectedVideo.performer.split(' ')[0]}`,
      props.selectedVideo.notes,
      [
        { text: 'OK', onPress: () => setDisplayedNotes(true) },
      ],
      { cancelable: false }
    );
  }

  const record = async () => {
    try {
      time1 = Date.now();
      const vid = await cameraRef.current.recordAsync({ quality: Camera.Constants.VideoQuality['720p'], mirror: true });
      setDuetteUri(vid.uri);
    } catch (e) {
      setError(true);
      throw new Error('error starting recording: ', e);
    }
  };

  const play = async () => {
    try {
      time2 = Date.now();
      await vidRef.current.playFromPositionAsync(time2 - time1, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
      time3 = Date.now();
      setPlayDelay(time3 - time2);
    } catch (e) {
      setError(true);
      throw new Error('error playing video: ', e);
    }
  };

  const toggleRecord = () => {
    if (recording) {
      setRecording(false);
      cameraRef.current.stopRecording();
      setShowPreviewModal(true);
    } else {
      setRecording(true);
      record();
      play();
    }
  };

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  };

  const handleCancel = async () => {
    try {
      await vidRef.current.unloadAsync();
      cameraRef.current.stopRecording();
      setShowRecordDuetteModal(false);
      deleteLocalFile(baseTrackUri);
    } catch (e) {
      deleteLocalFile(baseTrackUri);
      throw new Error('error unloading video: ', e);
    }
  };

  const handleTryAgain = async () => {
    await vidRef.current.stopAsync();
    cameraRef.current.stopRecording();
    setRecording(false);
  };

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.isLoaded !== vidLoaded) setVidLoaded(updateObj.isLoaded);
    if (!vidDoneBuffering && !updateObj.isBuffering) setVidDoneBuffering(true);
  };

  const handleError = () => {
    setError(false);
    setRecording(false);
    // deleteLocalFile(baseTrackUri);
    setShowPreviewModal(false);
  };

  return (
    error ? (
      <ErrorView handleGoBack={handleError} />
    ) : (
        <View style={styles.container}>
          {
            showPreviewModal ? (
              <ReviewDuette
                bluetooth={bluetooth}
                setShowRecordDuetteModal={setShowRecordDuetteModal}
                duetteUri={duetteUri}
                setShowPreviewModal={setShowPreviewModal}
                screenOrientation={screenOrientation}
                playDelay={playDelay}
                baseTrackUri={baseTrackUri}
                setSearchText={setSearchText}
              />
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
                        // ref={ref => setVidRef(ref)}
                        ref={vidRef}
                        source={{ uri: baseTrackUri }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="cover"
                        progressUpdateIntervalMillis={50}
                        onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
                        style={{
                          width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                          height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                        }}
                      />
                      {/* TODO: add codec to camera input? (e.g. .mov) */}
                      <Camera
                        style={{
                          width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                          height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                        }}
                        type={Camera.Constants.Type.front}
                        // ref={ref => setCameraRef(ref)}
                        ref={cameraRef}
                      >
                        <View>
                          <TouchableOpacity
                            onPress={!recording ? handleCancel : () => { }}
                          >
                            <Text style={{
                              ...styles.overlayText,
                              paddingLeft: screenOrientation === 'LANDSCAPE' ? 20 : 10,
                              paddingTop: screenOrientation === 'LANDSCAPE' ? 20 : 10,
                              fontSize: screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 22,
                            }}
                            >
                              {recording ? 'Recording' : 'Cancel'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {
                          vidLoaded && vidDoneBuffering &&
                          <View
                            style={styles.recordButtonContainer}>
                            <TouchableOpacity
                              onPress={toggleRecord}>
                              <Text style={{
                                ...styles.recordText,
                                fontSize: screenOrientation === 'LANDSCAPE' ? 18 : 13,
                              }}>{recording ? '' : 'record'}</Text>
                              <TouchableOpacity
                                onPress={toggleRecord}
                                style={{
                                  ...styles.recordButton,
                                  borderWidth: screenWidth / 100,
                                  width: screenWidth / 10,
                                  height: screenWidth / 10,
                                  backgroundColor: recording ? 'black' : 'red',
                                  marginBottom: screenOrientation === 'LANDSCAPE' ? 10 : 6,
                                }} />
                            </TouchableOpacity>
                          </View>
                        }
                        {
                          screenOrientation === 'LANDSCAPE' && recording &&
                          <TouchableOpacity
                            onPress={handleTryAgain}
                            style={styles.problemContainerLandscape}
                          >
                            <Text style={{ color: 'red', fontSize: 16 }}>Having a problem? Touch here to try again.</Text>
                          </TouchableOpacity>
                        }
                      </Camera>
                    </View>
                    {
                      screenOrientation === 'PORTRAIT' && recording &&
                      <TouchableOpacity
                        onPress={handleTryAgain}
                      >
                        <Text style={{ color: 'red', fontSize: 16, marginTop: 20 }}>Having a problem? Touch here to try again.</Text>
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
    fontWeight: 'normal',
    color: 'red',
  },
  problemContainerLandscape: {
    alignItems: 'center',
    paddingBottom: 10,
    height: 30,
  },
  recordButtonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  recordButton: {
    borderColor: 'darkred',
    alignSelf: 'center',
    borderRadius: 50,
    marginTop: 6,
  },
  recordText: {
    color: 'red',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  }
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteModal);
