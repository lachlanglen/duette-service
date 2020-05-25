/* eslint-disable max-statements */
/* eslint-disable complexity */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Alert, Image, View, Modal, Button, StyleSheet, Text, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import uuid from 'react-native-uuid';
import DisplayMergedVideo from './DisplayMergedVideo';
import CatsGallery from './CatsGallery';
import { getAWSVideoUrl } from '../constants/urls';
import ErrorView from './Error';
import PreviewAndSync from './PreviewAndSync';
import { postDuette } from '../redux/duettes';
import { deleteLocalFile } from '../services/utils';
import SavingVideo from './SavingVideo';

let date1 = 0;
let date2 = 0;

const ReviewDuette = (props) => {

  const {
    bluetooth,
    duetteUri,
    setShowPreviewModal,
    setShowRecordDuetteModal,
    screenOrientation,
    playDelay,
    baseTrackUri,
    setSearchText,
  } = props;

  const [displayMergedVideo, setDisplayMergedVideo] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewComplete, setPreviewComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vidARef, setVidARef] = useState(null);
  const [vidBRef, setVidBRef] = useState(null);
  const [vid1Ready, setVid1Ready] = useState(false);
  const [vid2Ready, setVid2Ready] = useState(false);
  const [bothVidsReady, setBothVidsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customOffset, setCustomOffset] = useState(0);
  const [error, setError] = useState(false);
  const [savingToCameraRoll, setSavingToCameraRoll] = useState(false);

  const handleSave = () => {
    setSaving(true);
  };

  const handleView = () => {
    setDisplayMergedVideo(true);
  };

  const handleShowPreview = async () => {
    setPreviewComplete(false);
    await vidBRef.playFromPositionAsync(customOffset + playDelay, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    date1 = Date.now();
    await vidARef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    date2 = Date.now();
    setIsPlaying(true);
  };

  const handleRedo = () => {
    setShowPreviewModal(false);
  };

  const handleGoHome = () => {
    setSearchText('');
    setSavingToCameraRoll(false);
    setShowPreviewModal(false);
    setShowRecordDuetteModal(false);
    deleteLocalFile(baseTrackUri);
  };

  const handlePlaybackStatusUpdate = (updateObj, whichVid) => {
    if (whichVid === 'vid1') {
      if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid1Ready(true)
      } else if (!vid1Ready && vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid1Ready(true);
        setBothVidsReady(true);
      } else if (updateObj.didJustFinish) {
        setPreviewComplete(true);
        setIsPlaying(false);
      }
    } else if (whichVid === 'vid2') {
      if (!vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setVid2Ready(true)
      } else if (vid1Ready && !vid2Ready && updateObj.isLoaded && !updateObj.isBuffering) {
        setBothVidsReady(true);
      } else if (updateObj.didJustFinish) {
        setPreviewComplete(true);
        setIsPlaying(false);
      }
    }
  };

  const handleSyncBack = async () => {
    if (customOffset <= (0 - playDelay)) return;
    await vidARef.stopAsync();
    await vidBRef.stopAsync();
    if (customOffset > (0 - playDelay) && customOffset < (50 - playDelay)) {
      const remainder = playDelay + customOffset;
      setCustomOffset(customOffset - remainder);
      await vidBRef.playFromPositionAsync(customOffset + playDelay - remainder, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
      date1 = Date.now();
      await vidARef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
      date2 = Date.now();
    } else {
      setCustomOffset(customOffset - 50);
      await vidBRef.playFromPositionAsync(customOffset + playDelay - 50, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
      date1 = Date.now();
      await vidARef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
      date2 = Date.now();
    }
  };

  const handleSyncForward = async () => {
    await vidARef.stopAsync();
    await vidBRef.stopAsync();
    setCustomOffset(customOffset + 50);
    await vidBRef.playFromPositionAsync(customOffset + playDelay + 50, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    date1 = Date.now();
    await vidARef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    date2 = Date.now();
  };

  const handleRestart = async () => {
    await vidARef.stopAsync();
    await vidBRef.stopAsync();
    await vidBRef.playFromPositionAsync(customOffset + playDelay, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    date1 = Date.now();
    await vidARef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    date2 = Date.now();
  };

  const handleError = () => {
    setDisplayMergedVideo(false);
    setPreviewComplete(false);
    setSaving(false);
    setError(false);
  };

  return (
    error ? (
      <ErrorView handleGoBack={handleError} />
    ) : (
        <View style={styles.container}>
          <Modal
            supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
          >{
              saving ? (
                <SavingVideo
                  type="duette"
                  duetteUri={duetteUri}
                  customOffset={customOffset}
                  playDelay={playDelay}
                  date1={date1}
                  date2={date2}
                  setSuccess={setSuccess}
                  setSaving={setSaving}
                  handleExit={handleGoHome}
                />
              ) : (
                  success ? (
                    // video has been merged
                    <View style={styles.saveContainer}>
                      <Text style={styles.savingHeader}>Video saved!</Text>
                      <Image source={{ uri: 'https://media.giphy.com/media/13OyGVcay7aWUE/giphy.gif' }} style={{ width: 300, height: 200, marginTop: 20, marginBottom: 20 }} />
                      <Button
                        title="View Video"
                        onPress={handleView}
                      />
                      <Button
                        disabled={savingToCameraRoll}
                        title={savingToCameraRoll ? 'Saving to Camera Roll...' : 'Save to Camera Roll'}
                        onPress={handleSaveToCameraRoll}
                      />
                      {
                        savingToCameraRoll &&
                        <ActivityIndicator size="small" color="#0047B9" />
                      }
                    </View>
                  ) : (
                      // video hasn't been merged yet
                      <PreviewAndSync
                        screenOrientation={screenOrientation}
                        setVidARef={setVidARef}
                        setVidBRef={setVidBRef}
                        handlePlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        duetteUri={duetteUri}
                        bluetooth={bluetooth}
                        handleShowPreview={handleShowPreview}
                        previewComplete={previewComplete}
                        isPlaying={isPlaying}
                        bothVidsReady={bothVidsReady}
                        handleSave={handleSave}
                        handleRedo={handleRedo}
                        handleSyncBack={handleSyncBack}
                        handleSyncForward={handleSyncForward}
                        baseTrackUri={baseTrackUri}
                        handleRestart={handleRestart}
                      />
                    )
                )
            }
          </Modal>
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
  saveContainer: {
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingHeader: {
    fontSize: 40,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#0047B9'
  },
});

const mapState = ({ selectedVideo, user }) => {
  return {
    selectedVideo,
    user,
  }
};

const mapDispatch = dispatch => {
  return {
    postDuette: details => dispatch(postDuette(details)),
  }
}

export default connect(mapState, mapDispatch)(ReviewDuette);
