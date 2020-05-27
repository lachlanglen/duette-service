/* eslint-disable max-statements */
/* eslint-disable complexity */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { View, Modal, StyleSheet } from 'react-native';
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
    playDelay,
    baseTrackUri,
    setSearchText,
  } = props;

  const [screenOrientation, setScreenOrientation] = useState('');
  const [previewComplete, setPreviewComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vidARef, setVidARef] = useState(null);
  const [vidBRef, setVidBRef] = useState(null);
  const [vid1Ready, setVid1Ready] = useState(false);
  const [vid2Ready, setVid2Ready] = useState(false);
  const [bothVidsReady, setBothVidsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customOffset, setCustomOffset] = useState(0);
  const [baseTrackVolume, setBaseTrackVolume] = useState(1);

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  };

  const handleSave = () => {
    setSaving(true);
  };

  const handleView = () => {
    setDisplayMergedVideo(true);
  };

  const handleShowPreview = async () => {
    setPreviewComplete(false);
    try {
      await vidBRef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset + playDelay,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: 1,
      })
      date1 = Date.now();
      await vidARef.setStatusAsync({
        shouldPlay: true,
        positionMillis: 0,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: baseTrackVolume,
      })
      date2 = Date.now();
      setIsPlaying(true);
    } catch (e) {
      throw new Error('error in handleShowPreview: ', e)
    }
  };

  const handleRedo = () => {
    setShowPreviewModal(false);
  };

  const handleGoHome = () => {
    setSearchText('');
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
    try {
      await vidARef.stopAsync();
      await vidBRef.stopAsync();
      if (customOffset > (0 - playDelay) && customOffset < (50 - playDelay)) {
        const remainder = playDelay + customOffset;
        setCustomOffset(customOffset - remainder);
        await vidBRef.setStatusAsync({
          shouldPlay: true,
          positionMillis: customOffset + playDelay - remainder,
          seekMillisToleranceBefore: 0,
          seekMillisToleranceAfter: 0,
          volume: 1,
        })
        date1 = Date.now();
        await vidARef.setStatusAsync({
          shouldPlay: true,
          positionMillis: 0,
          seekMillisToleranceBefore: 0,
          seekMillisToleranceAfter: 0,
          volume: baseTrackVolume,
        })
        date2 = Date.now();
      } else {
        setCustomOffset(customOffset - 50);
        await vidBRef.setStatusAsync({
          shouldPlay: true,
          positionMillis: customOffset + playDelay - 50,
          seekMillisToleranceBefore: 0,
          seekMillisToleranceAfter: 0,
          volume: 1,
        })
        date1 = Date.now();
        await vidARef.setStatusAsync({
          shouldPlay: true,
          positionMillis: 0,
          seekMillisToleranceBefore: 0,
          seekMillisToleranceAfter: 0,
          volume: baseTrackVolume,
        })
        date2 = Date.now();
      }
    } catch (e) {
      throw new Error('error in handleSyncBack: ', e)
    }
  };

  const handleSyncForward = async () => {
    // TODO: may need to add edge case if video is delayed for full length (would anyone actually do this?!)
    try {
      await vidARef.stopAsync();
      await vidBRef.stopAsync();
      setCustomOffset(customOffset + 50);
      await vidBRef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset + playDelay + 50,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: 1,
      })
      date1 = Date.now();
      await vidARef.setStatusAsync({
        shouldPlay: true,
        positionMillis: 0,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: baseTrackVolume,
      })
      date2 = Date.now();
    } catch (e) {
      throw new Error('error in handleSyncForward: ', e)
    }
  };

  const handleRestart = async () => {
    try {
      await vidARef.stopAsync();
      await vidBRef.stopAsync();
      await vidBRef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset + playDelay,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: 1,
      })
      date1 = Date.now();
      await vidARef.setStatusAsync({
        shouldPlay: true,
        positionMillis: 0,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: baseTrackVolume,
      })
      date2 = Date.now();
    } catch (e) {
      throw new Error('error in handleRestart: ', e)
    }
  };

  const reduceBaseTrackVolume = async () => {
    if (baseTrackVolume === 0.1) return;
    try {
      await vidARef.stopAsync();
      await vidBRef.stopAsync();
      setBaseTrackVolume(parseInt((baseTrackVolume - 0.1).toFixed(1)));
      await vidBRef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset + playDelay,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: 1,
      })
      date1 = Date.now();
      await vidARef.setStatusAsync({
        shouldPlay: true,
        positionMillis: 0,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: parseInt((baseTrackVolume - 0.1).toFixed(1)),
      })
      date2 = Date.now();
    } catch (e) {
      throw new Error('error in reduceBaseTrackVolume: ', e)
    }
  };

  const increaseBaseTrackVolume = async () => {
    if (baseTrackVolume === 1) return;
    try {
      await vidARef.stopAsync();
      await vidBRef.stopAsync();
      setBaseTrackVolume(parseInt((baseTrackVolume + 0.1).toFixed(1)));
      await vidBRef.setStatusAsync({
        shouldPlay: true,
        positionMillis: customOffset + playDelay,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: 1,
      })
      date1 = Date.now();
      await vidARef.setStatusAsync({
        shouldPlay: true,
        positionMillis: 0,
        seekMillisToleranceBefore: 0,
        seekMillisToleranceAfter: 0,
        volume: parseInt((baseTrackVolume + 0.1).toFixed(1)),
      })
      date2 = Date.now();
    } catch (e) {
      throw new Error('error in increaseBaseTrackVolume: ', e)
    }
  }

  return (
    <View style={styles.container}>
      <Modal
        onOrientationChange={handleModalOrientationChange}
        supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
      >{
          saving ? (
            <SavingVideo
              type="duette"
              duetteUri={duetteUri}
              customOffset={customOffset}
              playDelay={playDelay}
              baseTrackVolume={baseTrackVolume}
              date1={date1}
              date2={date2}
              setSaving={setSaving}
              handleExit={handleGoHome}
            />
          ) : (
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
                reduceBaseTrackVolume={reduceBaseTrackVolume}
                increaseBaseTrackVolume={increaseBaseTrackVolume}
              />
            )
        }
      </Modal>
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
