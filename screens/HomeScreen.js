/* eslint-disable max-statements */
/* eslint-disable complexity */
/* eslint-disable no-warning-comments */
import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, Modal, Button } from 'react-native';
import { connect } from 'react-redux'
import { Camera } from 'expo-camera';
import { ScreenOrientation } from 'expo';
import { Video } from 'expo-av';
import DetailsModal from './DetailsModal';
import { loadCats } from '../redux/cats';
import { fetchVideos } from '../redux/videos';
import FacebookSignin from './FacebookSignin';

const HomeScreen = (props) => {

  const [hasPermission, setHasPermission] = useState(null);
  const [screenOrientation, setScreenOrientation] = useState('')
  const [record, setRecord] = useState(false)
  const [recording, setRecording] = useState(false);
  const [dataUri, setDataUri] = useState('');
  const [cameraRef, setCameraRef] = useState(null);
  const [preview, setPreview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  let screenWidth = Math.round(Dimensions.get('window').width);
  let screenHeight = Math.round(Dimensions.get('window').height);

  useEffect(() => {
    detectOrientation();
  }, [])

  const detectOrientation = async () => {
    console.log('in detectOrientation')
    const { orientation } = await ScreenOrientation.getOrientationAsync();
    console.log('orientation: ', orientation)
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

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    // FIXME: doesn't reload when a vid is added
  }, []);

  // useEffect(() => {
  //   // props.setCats();
  //   // props.fetchVideos();
  // }, [])

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  // console.log('screen orientation in HomeScreen: ', screenOrientation)

  const startRecording = async () => {
    try {
      setRecording(true);
      const vid = await cameraRef.recordAsync()
      setDataUri(vid.uri)
      setPreview(true);
    } catch (e) {
      console.log('error in recordAsync: ', e)
    }
  }

  const stopRecording = () => {
    cameraRef.stopRecording();
    setRecording(false);
  }

  const toggleRecord = () => {
    if (recording) {
      // console.log('line 83')
      stopRecording();
    } else {
      // console.log('line 86')
      startRecording();
    }
  }

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  }

  const handleRecordExit = () => {
    if (!recording) setRecord(false);
  }

  const handleDetailsExit = () => {
    setRecord(false);
    setShowDetailsModal(false);
    setPreview(false);
  }

  const handleRedo = () => {
    setPreview(false);
  }

  const handleSave = () => {
    setShowDetailsModal(true);
  }

  // console.log('dataUri: ', dataUri)

  // console.log('preview: ', preview)
  // console.log('showDetailsModal: ', showDetailsModal)

  return (
    // !props.user ? (
    //   <FacebookSignin />
    // ) : (
    !preview ? (
      // record video:
      <View style={{ flex: 1 }}>
        {
          record ? (
            // user has clicked 'Record!' button
            <Modal
              animationType='fade'
              onOrientationChange={e => handleModalOrientationChange(e)}
              supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
            >
              <View style={{
                flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'black',
                paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0
              }}>
                <View
                  style={{
                    width: screenOrientation === 'PORTRAIT' ? screenWidth : screenHeight / 9 * 8,
                    height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 9 : screenHeight
                  }}>
                  <Camera style={{ width: '100%', height: '100%' }} type={Camera.Constants.Type.front} ref={ref => setCameraRef(ref)}>
                    <View>
                      <TouchableOpacity
                        onPress={handleRecordExit}
                      >
                        <Text style={{
                          color: 'red',
                          fontSize: recording ? 15 : 20,
                          paddingLeft: 20,
                          paddingTop: 20,
                          fontWeight: recording ? 'bold' : 'normal'
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
                          borderWidth: 5,
                          borderColor: recording ? 'darkred' : 'darkred',
                          alignSelf: 'flex-end',
                          width: 50,
                          height: 50,
                          backgroundColor: recording ? 'black' : 'red',
                          borderRadius: 50,
                          margin: 10,
                        }}
                      />
                    </View>
                  </Camera>
                </View>
              </View>
            </Modal>
          ) : (
              // landing page ('Record' button not clicked)
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                <Image
                  source={require('../assets/images/duette-logo-HD.png')} style={{ width: 300, height: 300 }} />
                <Button title="Record a new base track" onPress={() => setRecord(true)} />
                <Button title="Record a Duette" onPress={() => props.navigation.navigate("Links")} />
              </View>
            )
        }
      </View >
    ) : (
        // preview video:
        showDetailsModal ? (
          // ADD DETAILS MODAL
          <DetailsModal setPreview={setPreview} setRecord={setRecord} setShowDetailsModal={setShowDetailsModal} handleDetailsExit={handleDetailsExit} dataUri={dataUri} />
        ) : (
            // PREVIEW VIDEO MODAL
            <Modal
              animationType='fade'
              onOrientationChange={e => handleModalOrientationChange(e)}
              supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
            >
              <View
                style={{
                  flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  backgroundColor: 'black',
                  height: '100%',
                  paddingLeft: screenOrientation === 'PORTRAIT' ? 0 : (screenWidth - screenHeight / 9 * 8) / 2,
                  paddingTop: screenOrientation === 'PORTRAIT' ? (screenHeight - screenWidth / 8 * 9) / 2 : 0,
                }}>
                <View
                  style={{
                    width: screenOrientation === 'PORTRAIT' ? screenWidth : screenHeight / 9 * 8,
                    height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 9 : screenHeight,
                  }}>
                  <Video
                    source={{ uri: dataUri }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    positionMillis={50}
                    useNativeControls={true}
                    isLooping={false}
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
                <View style={{
                  flexDirection: screenOrientation === 'PORTRAIT' ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'black',
                  width: screenOrientation === 'PORTRAIT' ? '100%' : (screenWidth - screenHeight / 9 * 8) / 2,
                  height: screenOrientation === 'PORTRAIT' ? (screenHeight - screenWidth / 8 * 9) / 2 : '100%'
                }}>
                  <TouchableOpacity
                    style={{
                      ...styles.button,
                      marginVertical: screenOrientation === 'PORTRAIT' ? 0 : 25,
                      marginHorizontal: screenOrientation === 'PORTRAIT' ? 20 : 0,
                    }}
                    onPress={handleSave}>
                    <Text style={styles.overlayText}
                    >Save
                        </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      ...styles.button,
                      marginVertical: screenOrientation === 'PORTRAIT' ? 0 : 25,
                      marginHorizontal: screenOrientation === 'PORTRAIT' ? 20 : 0,
                    }}
                    onPress={handleRedo}>
                    <Text style={styles.overlayText}
                    >Redo
                        </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )
      )
    // )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
  },
  overlayText: {
    color: 'blue',
    fontSize: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    borderRadius: 5,
  },
  overlay: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
    height: '100%',
    borderRadius: 5,
    opacity: 0.75
  },
  button: {
    // width: '50%',
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
  }
});

const mapDispatch = dispatch => {
  return {
    setCats: () => dispatch(loadCats()),
    fetchVideos: () => dispatch(fetchVideos())
  }
}

export default connect(null, mapDispatch)(HomeScreen)