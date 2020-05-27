/* eslint-disable complexity */
import React from 'react';
import { connect } from 'react-redux';
import { Text, TouchableOpacity, View, Dimensions, Button, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../constants/urls';
import buttonStyles from '../styles/button';

const PreviewAndSync = (props) => {
  const {
    screenOrientation,
    setVidARef,
    setVidBRef,
    handlePlaybackStatusUpdate,
    duetteUri,
    bluetooth,
    handleShowPreview,
    previewComplete,
    isPlaying,
    bothVidsReady,
    handleSave,
    handleRedo,
    handleSyncBack,
    handleSyncForward,
    baseTrackUri,
    handleRestart,
    reduceBaseTrackVolume,
    increaseBaseTrackVolume,
    baseTrackVolume,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  return (
    <View style={{
      ...styles.container,
      // paddingVertical: screenOrientation === 'PORTRAIT' && !previewComplete ? 20 : 0,
      paddingTop: screenOrientation === 'PORTRAIT' && previewComplete ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
    }}>
      <View style={{
        flexDirection: 'row',
        marginTop: screenOrientation === 'PORTRAIT' && !previewComplete ? 20 : 0,
      }}>
        <Video
          ref={ref => setVidARef(ref)}
          source={{
            uri: baseTrackUri,
          }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={false}
          // positionMillis={0}
          isLooping={false}
          style={{
            width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
            height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
          }}
          onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update, 'vid1')}
        />
        <Video
          ref={ref => setVidBRef(ref)}
          source={{
            uri: duetteUri,
          }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={false}
          // positionMillis={bluetooth ? 200 : 0}
          isLooping={false}
          style={{
            width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
            height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
          }}
          onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update, 'vid2')}
        />
        {
          // if preview hasn't played yet
          !previewComplete && !isPlaying ? (
            <TouchableOpacity
              onPress={handleShowPreview}
              style={{
                ...styles.overlay,
                width: screenWidth,
                height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9
              }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{
                  fontSize: screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 20,
                  fontWeight: 'bold',
                  marginRight: 10,
                }}>
                  {bothVidsReady ? 'Touch to preview!' : 'Loading...'}
                </Text>
                {
                  !bothVidsReady &&
                  <ActivityIndicator size="small" color="#0047B9" />
                }
              </View>
            </TouchableOpacity>
          ) : (
              // if preview has played (previewComplete)
              previewComplete &&
              <TouchableOpacity
                style={{
                  ...styles.overlay,
                  opacity: 0.8,
                  paddingTop: 40,
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  width: screenWidth,
                  height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                }}>
                <TouchableOpacity
                  style={{
                    ...buttonStyles.regularButton,
                    width: 200,
                  }}
                  onPress={handleShowPreview}>
                  <Text
                    style={buttonStyles.regularButtonText}>
                    View again
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    ...buttonStyles.regularButton,
                    width: 100,
                  }}
                  onPress={handleSave}>
                  <Text
                    style={buttonStyles.regularButtonText}>
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    ...buttonStyles.regularButton,
                    width: 100,
                  }}
                  onPress={handleRedo}>
                  <Text
                    style={buttonStyles.regularButtonText}>
                    Redo
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )
        }
      </View>
      {
        screenOrientation === 'PORTRAIT' && !previewComplete &&
        <View>
          <Text
            style={styles.instruction}>Not perfectly in sync? Use the arrows below to adjust to your taste!
          </Text>
          <View
            style={styles.syncIconsContainer}>
            <Icon
              onPress={handleSyncBack}
              name="fast-rewind"
              type="material"
              color="white"
              size={50} />
            <Text
              style={{
                fontSize: 25,
                color: 'white',
                alignSelf: 'center',
              }}>|
            </Text>
            <Icon
              onPress={handleSyncForward}
              name="fast-forward"
              type="material"
              color="white"
              size={50} />
          </View>
          <Text
            style={styles.hintTitle}>Hint:
          </Text>
          <View
            style={styles.hintContainer}>
            <Text
              style={{ color: 'white', fontSize: 14, }}>If your video is <Text style={{ color: 'yellow' }}>behind</Text> the base track, press
            </Text>
            <Icon
              name="fast-forward"
              type="material"
              color="yellow" />
          </View>
          <View
            style={{
              ...styles.hintContainer,
              marginBottom: 10,

            }}>
            <Text
              style={{ color: 'white', fontSize: 14, }}>If your video is <Text style={{ color: 'yellow' }}>ahead of</Text> the base track, press
            </Text>
            <Icon
              name="fast-rewind"
              type="material"
              color="yellow" />
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 5, marginBottom: 15 }}>
            <Text style={styles.volumeControlsTitle}>Volume control:</Text>
            <View style={styles.volumeControlsContainer}>
              <Text style={styles.volumeInstructionText}>Base track volume:</Text>
              <TouchableOpacity
                style={{
                  ...styles.volumeControlsButton,
                  backgroundColor: baseTrackVolume < 0.2 ? 'grey' : '#0047B9',
                  paddingLeft: 1,
                }}
                onPress={reduceBaseTrackVolume}
                disabled={baseTrackVolume === 0.1}
              >
                <Text style={styles.volumeButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  ...styles.volumeControlsButton,
                  backgroundColor: baseTrackVolume > 0.9 ? 'grey' : '#0047B9',
                }}
                onPress={increaseBaseTrackVolume}
                disabled={baseTrackVolume === 0.9}
              >
                <Text style={styles.volumeButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
            <TouchableOpacity
              style={{
                ...buttonStyles.regularButton,
                width: 100,
                marginBottom: 10,
              }}
              onPress={!previewComplete && !isPlaying && bothVidsReady ? handleShowPreview : handleSave} >
              <Text
                style={{
                  ...buttonStyles.regularButtonText,
                  fontSize: Platform.OS === 'ios' ? 20 : 17,
                  fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
                }}>{!previewComplete && !isPlaying && bothVidsReady ? 'Preview' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...buttonStyles.regularButton,
                width: 120,
                marginBottom: 10,
              }}
              onPress={handleRedo} >
              <Text
                style={{
                  ...buttonStyles.regularButtonText,
                  fontSize: Platform.OS === 'ios' ? 20 : 17,
                  fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
                }}>Re-record
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleRestart}
            style={styles.problemContainer}
          >
            <Text style={{ fontSize: 16, color: 'red' }}>Having a problem? Touch here to refresh.</Text>
          </TouchableOpacity>
        </View>
      }
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'black',
    height: '100%',
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderColor: 'black',
  },
  overlayText: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '600',
    color: 'white',
  },
  button: {
    backgroundColor: "#0047B9",
    opacity: 1,
    alignSelf: 'center',
    borderColor: 'black',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1
  },
  instruction: {
    color: 'white',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  syncIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintTitle: {
    fontStyle: 'italic',
    marginTop: 10,
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  volumeControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '90%',
    marginBottom: 20,
  },
  volumeControlsTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 14,
  },
  volumeControlsButton: {
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeInstructionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  volumeButtonText: {
    color: 'white',
    textAlign: 'center',
    paddingBottom: 2,
    fontSize: 20,
  },
  problemContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 15,
    height: 30,
  },
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo,
  }
}

export default connect(mapState)(PreviewAndSync);
