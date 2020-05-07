/* eslint-disable complexity */
import React from 'react';
import { connect } from 'react-redux';
import { Text, TouchableOpacity, View, Dimensions, Button, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../constants/urls';

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
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  console.log('props: ', props);

  return (
    <View style={{
      ...styles.container,
      paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
    }}>
      <View style={{ flexDirection: 'row' }}>
        <Video
          ref={ref => setVidARef(ref)}
          source={{
            uri: getAWSVideoUrl(props.selectedVideo.id),
          }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          positionMillis={0}
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
          positionMillis={bluetooth ? 200 : 0}
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
              <Text style={{
                fontSize: screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 20,
                fontWeight: 'bold'
              }}>
                {bothVidsReady ? 'Touch to preview!' : 'Loading...'}
              </Text>
            </TouchableOpacity>
          ) : (
              // if preview has played (previewComplete)
              previewComplete &&
              <TouchableOpacity
                style={{
                  ...styles.overlay,
                  opacity: 0.8,
                  flexDirection: 'row',
                  width: screenWidth,
                  height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleShowPreview}>
                  <Text
                    style={styles.overlayText}>
                    View again
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSave}>
                  <Text
                    style={styles.overlayText}>
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRedo}>
                  <Text
                    style={styles.overlayText}>
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
              size={60} />
            <Text
              style={{
                fontSize: 30,
                color: 'white',
                alignSelf: 'center',
              }}>|
            </Text>
            <Icon
              onPress={handleSyncForward}
              name="fast-forward"
              type="material"
              color="white"
              size={60} />
          </View>
          <Text
            style={styles.hintTitle}>Hint:
          </Text>
          <View
            style={styles.hintContainer}>
            <Text
              style={{ color: 'white' }}>If your video is <Text style={{ color: 'yellow' }}>behind</Text> the accompaniment, press
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
              style={{ color: 'white' }}>If your video is <Text style={{ color: 'yellow' }}>ahead of</Text> the accompaniment, press
            </Text>
            <Icon
              name="fast-rewind"
              type="material"
              color="yellow" />
          </View>
          <Button
            title="Save"
            onPress={handleSave} />
        </View>
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
    marginTop: 20,
    marginVertical: 20,
    textAlign: 'center',
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
    marginTop: 30,
    color: 'white',
    textAlign: 'center',
  },
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo,
  }
}

export default connect(mapState)(PreviewAndSync);
