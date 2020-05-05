/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Image, View, Button } from 'react-native';
import { connect } from 'react-redux'
import { Camera } from 'expo-camera';
import DetailsModal from '../components/DetailsModal';
import { fetchVideos } from '../redux/videos';
import FacebookSignin from '../components/FacebookSignin';
import UserInfoMenu from '../components/UserInfoMenu';
import Error from '../components/Error';
import RecordAccompaniment from '../components/RecordAccompaniment';
import PreviewAccompaniment from '../components/PreviewAccompaniment';

const AccompanimentScreen = (props) => {

  const [hasPermission, setHasPermission] = useState(null);
  const [record, setRecord] = useState(false);
  const [recording, setRecording] = useState(false);
  const [dataUri, setDataUri] = useState('');
  const [cameraRef, setCameraRef] = useState(null);
  const [preview, setPreview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState(false);

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
          setError(true);
        }
      }
    }
    getPermissions();
  }, []);

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
              <View style={{ flex: 1 }}>
                {
                  record ? (
                    // user has clicked 'Record!' button
                    <RecordAccompaniment
                      setCameraRef={setCameraRef}
                      handleRecordExit={handleRecordExit}
                      recording={recording}
                      toggleRecord={toggleRecord}
                    />
                  ) : (
                      // landing page ('Record!' button not clicked)
                      <View style={{ flex: 1, backgroundColor: 'white' }}>
                        {
                          props.displayUserInfo &&
                          <UserInfoMenu />
                        }
                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                          <Image
                            source={require('../assets/images/duette-logo-HD.png')} style={{ width: 300, height: 300 }} />
                          <Button title="Record a new base track" onPress={() => setRecord(true)} />
                          <Button title="Record a Duette" onPress={() => props.navigation.navigate('Duette')} />
                        </View>
                      </View>
                    )
                }
              </View >
            ) : (
                // preview accompaniment:
                showDetailsModal ? (
                  // add accompaniment details
                  <DetailsModal setPreview={setPreview} setRecord={setRecord} setShowDetailsModal={setShowDetailsModal} handleDetailsExit={handleDetailsExit} dataUri={dataUri} />
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
}

const mapDispatch = dispatch => {
  return {
    fetchVideos: () => dispatch(fetchVideos())
  }
}

const mapState = ({ user, videos, displayUserInfo }) => {
  return {
    user,
    videos,
    displayUserInfo
  }
}

export default connect(mapState, mapDispatch)(AccompanimentScreen);
