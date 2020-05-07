/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Image, View, Dimensions, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { connect } from 'react-redux'
import { Camera } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';
import DetailsModal from '../components/DetailsModal';
import { fetchVideos } from '../redux/videos';
import FacebookSignin from '../components/FacebookSignin';
import UserInfoMenu from '../components/UserInfoMenu';
import Error from '../components/Error';
import RecordAccompanimentAndroid from '../components/android/RecordAccompaniment';
import RecordAccompanimentIos from '../components/ios/RecordAccompaniment';
import PreviewAccompaniment from '../components/PreviewAccompaniment';
import buttonStyles from '../styles/button';

const AccompanimentScreen = (props) => {

  const [hasPermission, setHasPermission] = useState(null);
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
      const { status } = await Camera.getPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        const permissions = await Camera.requestPermissionsAsync();
        if (permissions.status === 'granted') {
          setHasPermission(true);
        } else {
          // TODO: fix this to offer user a way to fix in settings
          setError(true);
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
  })

  const startRecording = async () => {
    try {
      setRecording(true);
      const vid = await cameraRef.recordAsync()
      setDataUri(vid.uri)
      setPreview(true);
    } catch (e) {
      console.log('error in recordAsync: ', e);
      setError(true);
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
    setError(false);
  };

  return (
    error ? (
      <Error handleGoBack={handleError} />
    ) : (
        // is user currently signed in?
        // ==> NO
        !props.user.id ? (
          // send to facebook signin & store accessToken, expires & facebookId on secure store
          <FacebookSignin />
        ) : (
            // ==> YES
            !preview && hasPermission ? (
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
                    <PreviewAccompaniment
                      dataUri={dataUri}
                      handleSave={handleSave}
                      handleRedo={handleRedo}
                    />
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

const mapState = ({ user, videos, displayUserInfo }) => {
  return {
    user,
    videos,
    displayUserInfo
  }
};

export default connect(mapState, mapDispatch)(AccompanimentScreen);
