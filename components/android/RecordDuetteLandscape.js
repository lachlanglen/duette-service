/* eslint-disable complexity */
import React from 'react';
import { connect } from 'react-redux';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../../constants/urls';

let screenWidth = Math.floor(Dimensions.get('window').width);
let screenHeight = Math.floor(Dimensions.get('window').height);

const RecordDuetteLandscape = (props) => {
  const {
    recording,
    handleCancel,
    setVidRef,
    handlePlaybackStatusUpdate,
    setCameraRef,
    toggleRecord,
    handleTryAgain,
  } = props;

  return (
    <View style={styles.container}>
      {/* TODO: add codec to camera input? (e.g. .mov) */}
      <Camera
        style={styles.camera}
        ratio="16:9"
        type={Camera.Constants.Type.front}
        ref={ref => setCameraRef(ref)} >
        <View style={styles.recordButtonContainer}>
          <TouchableOpacity
            onPress={toggleRecord}
          >
            <Text style={styles.recordButtonText}
            >
              {recording ? '' : 'record'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleRecord}
            style={{
              ...styles.recordButton,
              borderColor: recording ? 'darkred' : 'darkred',
              backgroundColor: recording ? 'black' : 'red',
            }}
          />
        </View>
      </Camera>
      <View style={styles.videoContainer}>
        <Video
          ref={ref => setVidRef(ref)}
          source={{ uri: getAWSVideoUrl(props.selectedVideo.id) }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          progressUpdateIntervalMillis={50}
          onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
          style={styles.video}
        />
      </View>
      <View style={styles.recordingOrCancelContainer}>
        <TouchableOpacity
          onPress={!recording ? handleCancel : () => { }}
          style={styles.recordingOrCancelButton}
        >
          <Text
            style={{
              ...styles.recordingOrCancelText,
              fontSize: recording ? 15 : 20,
              fontWeight: recording ? 'bold' : 'normal',
            }}
          >
            {recording ? 'Recording' : 'Cancel'}
          </Text>
        </TouchableOpacity>
        {
          recording &&
          <TouchableOpacity
            onPress={handleTryAgain}
            style={styles.problemContainer}
          >
            <Text
              style={styles.problemText}>Having a problem? Touch here to try again.
            </Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    width: screenHeight / 9 * 16,
    height: screenHeight,
    backgroundColor: 'black',
  },
  camera: {
    marginLeft: screenWidth - screenHeight / 9 * 8,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  recordButtonContainer: {
    width: screenWidth,
    height: screenHeight,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  recordButtonText: {
    color: 'red',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  recordButton: {
    borderWidth: 5,
    width: 50,
    height: 50,
    borderRadius: 50,
    marginBottom: 35,
  },
  videoContainer: {
    position: 'absolute',
    width: screenHeight / 9 * 8,
    height: screenHeight,
  },
  video: {
    width: screenWidth / 2,
    height: screenHeight,
  },
  recordingOrCancelContainer: {
    position: 'absolute',
    height: screenHeight * 0.95,
    justifyContent: 'space-between',
  },
  recordingOrCancelButton: {
    alignSelf: 'flex-start',
    paddingLeft: 15,
    paddingTop: 10,
  },
  recordingOrCancelText: {
    color: 'red',
    textAlign: 'center',
  },
  problemContainer: {
    paddingLeft: 15,
    paddingBottom: 15,
    alignSelf: 'flex-end',
  },
  problemText: {
    color: 'red',
    fontSize: 15,
    marginTop: 20,
  }
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteLandscape);
