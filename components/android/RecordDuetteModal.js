/* eslint-disable complexity */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { View, Modal, StyleSheet } from 'react-native';
import Error from '../Error';
import ReviewDuette from '../ReviewDuette';
import RecordDuettePortrait from './RecordDuettePortrait';
import RecordDuetteLandscape from './RecordDuetteLandscape';

const RecordDuetteModal = (props) => {

  const {
    setShowRecordDuetteModal,
    bluetooth,
    screenOrientation,
  } = props;

  const [recording, setRecording] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [duetteUri, setDuetteUri] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [vidRef, setVidRef] = useState(null);
  const [vidLoaded, setVidLoaded] = useState(false);
  const [vidDoneBuffering, setVidDoneBuffering] = useState(false);
  const [error, setError] = useState(false);

  const record = async () => {
    try {
      const vid = await cameraRef.recordAsync();
      setDuetteUri(vid.uri);
      setShowPreviewModal(true);
    } catch (e) {
      console.log('error starting recording: ', e);
      setError(true);
    }
  };

  const play = async () => {
    try {
      await vidRef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    } catch (e) {
      console.log('error playing video: ', e);
      setError(true);
    }
  };

  const toggleRecord = () => {
    if (recording) {
      setRecording(false);
      cameraRef.stopRecording();
    } else {
      setRecording(true);
      record();
      play();
    }
  };

  const handleCancel = async () => {
    try {
      await vidRef.unloadAsync();
      cameraRef.stopRecording();
      setShowRecordDuetteModal(false);
    } catch (e) {
      console.log('error unloading video: ', e);
    }
  };

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.isLoaded !== vidLoaded) setVidLoaded(updateObj.isLoaded);
    if (updateObj.isBuffering === vidDoneBuffering) setVidDoneBuffering(!updateObj.isBuffering);
  };

  const handleError = () => {
    setRecording(false);
    setShowPreviewModal(false);
  };

  const handleTryAgain = async () => {
    await vidRef.stopAsync();
    cameraRef.stopRecording();
    setRecording(false);
  };

  return (
    error ? (
      <Error handleGoBack={handleError} />
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
              />
            ) : (
                <Modal
                  onRequestClose={handleCancel}
                  supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                >
                  {
                    screenOrientation === 'PORTRAIT' ? (
                      <RecordDuettePortrait
                        recording={recording}
                        handleCancel={handleCancel}
                        setVidRef={setVidRef}
                        handlePlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        setCameraRef={setCameraRef}
                        toggleRecord={toggleRecord}
                        handleTryAgain={handleTryAgain}
                      />
                    ) : (
                        <RecordDuetteLandscape
                          recording={recording}
                          handleCancel={handleCancel}
                          setVidRef={setVidRef}
                          handlePlaybackStatusUpdate={handlePlaybackStatusUpdate}
                          setCameraRef={setCameraRef}
                          toggleRecord={toggleRecord}
                          handleTryAgain={handleTryAgain}
                        />
                      )
                  }
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
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteModal);
