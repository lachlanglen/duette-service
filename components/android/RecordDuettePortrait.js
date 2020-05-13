/* eslint-disable complexity */
import React from 'react';
import { connect } from 'react-redux';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../../constants/urls';

let screenWidth = Math.floor(Dimensions.get('window').width);
let screenHeight = Math.floor(Dimensions.get('window').height);

const RecordDuettePortrait = (props) => {
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
      <View style={styles.recordingOrCancelContainer}>
        <TouchableOpacity
          onPress={!recording ? handleCancel : () => { }}
        >
          <Text style={{
            color: 'red',
            fontSize: recording ? 15 : 20,
            fontWeight: recording ? 'bold' : 'normal',
            textAlign: 'center',
          }}
          >
            {recording ? 'Recording' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={styles.mediaContainer}>
        <View style={styles.videoContainer}>
          <View style={styles.videoOffset} />
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
        <View style={styles.cameraContainer}>
          {/* TODO: add codec to camera input? (e.g. .mov) */}
          <Camera
            style={styles.camera}
            ratio="16:9"
            type={Camera.Constants.Type.front}
            ref={ref => setCameraRef(ref)} >
            <View style={styles.cameraOverlayContainer}>
              <View style={styles.cameraOverlay} />
              <View style={styles.cameraOverlay} />
            </View>
          </Camera>
        </View>
      </View>
      <View style={styles.recordButtonContainer}>
        <View style={styles.recordTextContainer}>
          <TouchableOpacity
            onPress={toggleRecord}
          >
            <Text style={styles.recordText}>
              {recording ? '' : 'record'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={toggleRecord}
          style={{
            ...styles.recordButton,
            borderColor: recording ? 'darkred' : 'darkred',
            backgroundColor: recording ? 'black' : 'red',
          }}
        />
      </View>
      {
        recording &&
        <TouchableOpacity
          onPress={handleTryAgain}
        >
          <Text style={styles.problemText}>Having a problem? Touch here to try again.</Text>
        </TouchableOpacity>
      }
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    height: '100%',
  },
  recordingOrCancelContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    height: '15%',
    width: '50%',
  },
  mediaContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    height: screenWidth / 9 * 8,
    width: '100%',
  },
  videoContainer: {
    height: '100%',
    width: '50%',
    backgroundColor: 'black',
  },
  videoOffset: {
    height: (screenWidth / 9 * 8 - screenWidth / 16 * 9) / 2,
    width: '100%',
    backgroundColor: 'black',
  },
  video: {
    width: screenWidth / 2,
    height: screenWidth / 16 * 9,
  },
  cameraContainer: {
    height: '100%',
    width: '50%',
    backgroundColor: 'black',
  },
  camera: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  cameraOverlayContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  cameraOverlay: {
    height: (screenWidth / 9 * 8 - screenWidth / 16 * 9) / 2,
    width: '100%',
    backgroundColor: 'black',
  },
  recordButtonContainer: {
    backgroundColor: 'black',
    height: '15%',
    width: '50%',
  },
  recordTextContainer: {
    backgroundColor: 'black',
    width: '100%',
    height: '18.3%',
    justifyContent: 'flex-end',
  },
  recordText: {
    color: 'red',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  recordButton: {
    borderRadius: 50,
    margin: 10,
    borderWidth: 5,
    alignSelf: 'center',
    width: 50,
    height: 50,
  },
  problemText: {
    color: 'red',
    marginTop: 20,
    width: '100%',
  }
})

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuettePortrait);