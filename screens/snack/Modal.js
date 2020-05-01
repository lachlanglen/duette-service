/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';

const videoUrl = 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4'
const AWSUrl = 'https://duette.s3.us-east-2.amazonaws.com/d68770b5-914e-4689-b08a-1ff8270b6539'

const RecordVideoModal = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const { showModal, setShowModal } = props;

  const [recording, setRecording] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [duetteUri, setDuetteUri] = useState('');
  const [screenOrientation, setScreenOrientation] = useState('');
  const [vidRef, setVidRef] = useState(null);
  const [vidLoaded, setVidLoaded] = useState(false);
  const [vidDoneBuffering, setVidDoneBuffering] = useState(false);

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

  const toggleRecord = async () => {
    if (recording) {
      setRecording(false);
      cameraRef.stopRecording();
    } else {
      try {
        setRecording(true);
        await vidRef.playAsync();
        const vid = await cameraRef.recordAsync();
        setDuetteUri(vid.uri);
      } catch (e) {
        console.log('error recording: ', e)
      }
    }
  }

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  }

  const handleCancel = () => {
    vidRef.unloadAsync()
      .then(() => {
        console.log('successfully unloaded video')
        setShowModal(false);
      })
      .catch((e) => {
        console.log('error unloading video: ', e)
        setShowModal(false);
      })
  }

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.isLoaded !== vidLoaded) setVidLoaded(updateObj.isLoaded);
    if (updateObj.isBuffering === vidDoneBuffering) setVidDoneBuffering(!updateObj.isBuffering);
  }

  return (
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
            source={{ uri: AWSUrl }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            positionMillis={0}
            progressUpdateIntervalMillis={50}
            onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
            style={{ width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2, height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9 }}
          />
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

export default RecordVideoModal;