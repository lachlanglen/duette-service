/* eslint-disable max-statements */
/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Image, View, Dimensions, StyleSheet, TouchableOpacity, Text, Platform, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux'
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Permissions from 'expo-permissions';
import DetailsModal from '../components/DetailsModal';
import { fetchVideos } from '../redux/videos';
import FacebookSignin from '../components/FacebookSignin';
import UserInfoMenu from '../components/UserInfoMenu';
import ErrorView from '../components/Error';
import RecordAccompanimentAndroid from '../components/android/RecordAccompaniment';
import RecordAccompanimentIos from '../components/ios/RecordAccompaniment';
import PreviewAccompanimentAndroid from '../components/android/PreviewAccompaniment';
import PreviewAccompanimentIos from '../components/ios/PreviewAccompaniment';
import buttonStyles from '../styles/button';
import LoadingSpinner from '../components/LoadingSpinner';

const AccompanimentScreen = (props) => {

  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [record, setRecord] = useState(false);
  const [recording, setRecording] = useState(false);
  const [dataUri, setDataUri] = useState('');
  const [cameraRef, setCameraRef] = useState(null);
  const [preview, setPreview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');

  let screenWidth = Math.round(Dimensions.get('window').width);
  let screenHeight = Math.round(Dimensions.get('window').height);

  useEffect(() => {
    async function getPermissions() {
      const perms = await Permissions.getAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING);
      if (perms.permissions.audioRecording.granted) {
        setHasAudioPermission(true);
      } else {
        const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        if (status === 'granted') {
          setHasAudioPermission(true);
        } else {
          throw new Error('Audio permissions not granted');
        }
      }
      if (perms.permissions.camera.granted) {
        setHasCameraPermission(true);
      } else {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        if (status === 'granted') {
          setHasCameraPermission(true);
        } else {
          throw new Error('Camera permissions not granted');
        }
      }
    }
    getPermissions();
  }, []);

  useEffect(() => {
    const detectOrientation = () => {
      if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
      if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
      ScreenOrientation.addOrientationChangeListener(info => {
        if (info.orientationInfo.orientation === 'UNKNOWN') {
          if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
          if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
        } else {
          if (info.orientationInfo.orientation === 1 || info.orientationInfo.orientation === 2) setScreenOrientation('PORTRAIT');
          if (info.orientationInfo.orientation === 3 || info.orientationInfo.orientation === 4) setScreenOrientation('LANDSCAPE');
        }
      })
    }
    detectOrientation();
  });

  const startRecording = async () => {
    try {
      setRecording(true);
      const vid = await cameraRef.recordAsync()
      setDataUri(vid.uri)
      setPreview(true);
    } catch (e) {
      setError(true);
      throw new Error('error in recordAsync: ', e);
    }
  };

  const stopRecording = () => {
    cameraRef.stopRecording();
    setRecording(false);
  };

  const toggleRecord = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleRecordExit = () => {
    if (!recording) setRecord(false);
  };

  const handleDetailsExit = () => {
    setRecord(false);
    setShowDetailsModal(false);
    setPreview(false);
  };

  const handleRedo = () => {
    setPreview(false);
  };

  const handleSave = () => {
    setShowDetailsModal(true);
  };

  const handleError = () => {
    setPreview(false);
    setRecord(false);
    setRecording(false);
    setError(false);
  };

  // console.log('error: ', error);
  // console.log('props: ', props);
  // console.log('props.user.id: ', props.user.id);
  // console.log('preview: ', preview);
  // console.log('hasAudioPermission: ', hasAudioPermission);
  // console.log('hasCameraPermission: ', hasCameraPermission);
  // console.log('record: ', record);
  // console.log('showDetailsModal: ', showDetailsModal);
  // console.log('///////////////');

  return (
    error ? (
      <ErrorView handleGoBack={handleError} />
    ) : (
        !props.user.id ? (
          !props.dataLoaded ? (
            <LoadingSpinner />
          ) : (
              <FacebookSignin />
            )
        ) : (
            // ==> YES
            !preview ? (
              // record video:
              <View style={styles.container}>
                {
                  record ? (
                    // user has clicked 'Record!' button
                    Platform.OS === 'android' ? (
                      <RecordAccompanimentAndroid
                        setCameraRef={setCameraRef}
                        handleRecordExit={handleRecordExit}
                        recording={recording}
                        toggleRecord={toggleRecord}
                        screenOrientation={screenOrientation}
                      />
                    ) : (
                        <RecordAccompanimentIos
                          setCameraRef={setCameraRef}
                          handleRecordExit={handleRecordExit}
                          recording={recording}
                          toggleRecord={toggleRecord}
                        />
                      )
                  ) : (
                      // landing page ('Record!' button not clicked)
                      <View
                        style={styles.landingPage}>
                        {
                          props.displayUserInfo &&
                          <UserInfoMenu />
                        }
                        <View style={styles.logoAndButtonsContainer}>
                          <Image
                            source={require('../assets/images/duette-logo-HD.png')}
                            style={styles.logo} />
                          <View>
                            <TouchableOpacity
                              style={{
                                ...buttonStyles.regularButton,
                                width: '75%',
                              }}
                              onPress={() => setRecord(true)}
                            >
                              <Text style={buttonStyles.regularButtonText}>Record a new base track</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                ...buttonStyles.regularButton,
                                width: '60%'
                              }}
                              onPress={() => props.navigation.navigate('Duette')}
                            >
                              <Text style={buttonStyles.regularButtonText}>Record a Duette</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )
                }
              </View >
            ) : (
                // preview accompaniment:
                showDetailsModal ? (
                  // add accompaniment details
                  <DetailsModal
                    setPreview={setPreview}
                    setRecord={setRecord}
                    setShowDetailsModal={setShowDetailsModal}
                    handleDetailsExit={handleDetailsExit}
                    dataUri={dataUri} />
                ) : (
                    // preview accompaniment
                    Platform.OS === 'android' ? (
                      <PreviewAccompanimentAndroid
                        dataUri={dataUri}
                        handleSave={handleSave}
                        handleRedo={handleRedo}
                        screenOrientation={screenOrientation}
                      />
                    ) : (
                        <PreviewAccompanimentIos
                          dataUri={dataUri}
                          handleSave={handleSave}
                          handleRedo={handleRedo}
                        />
                      )
                  )
              )
          )
      )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  landingPage: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoAndButtonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 300,
    height: 300,
  }
})

const mapDispatch = dispatch => {
  return {
    fetchVideos: () => dispatch(fetchVideos())
  }
};

const mapState = ({ user, videos, displayUserInfo, dataLoaded }) => {
  return {
    user,
    videos,
    displayUserInfo,
    dataLoaded,
  }
};

export default connect(mapState, mapDispatch)(AccompanimentScreen);
