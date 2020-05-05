/* eslint-disable complexity */
import React from 'react';
import { Text, TouchableOpacity, View, Dimensions, StyleSheet, Image } from 'react-native';
import { Video } from 'expo-av';
import { getAWSVideoUrl, getAWSThumbnailUrl } from '../constants/urls';

const VideoItem = (props) => {

  const {
    id,
    title,
    composer,
    theKey,
    performer,
    previewVid,
    setPreviewVid,
    handlePreview,
    handleUse
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.didJustFinish) setPreviewVid('')
  }

  return (
    <View style={styles.item}>
      <View>
        {
          previewVid === id ? (
            <Video
              source={{ uri: getAWSVideoUrl(id) }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="cover"
              shouldPlay
              useNativeControls={true}
              isLooping={false}
              onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
              style={{
                ...styles.media,
                width: screenWidth * 0.8,
                height: screenWidth * 0.8 / 8 * 9
              }} />
          ) : (
              <View>
                <Image
                  source={{ uri: getAWSThumbnailUrl(id) }}
                  style={{
                    ...styles.media,
                    width: screenWidth * 0.8,
                    height: screenWidth * 0.8 / 8 * 9
                  }} />
                <TouchableOpacity
                  style={{
                    ...styles.overlay,
                    width: screenWidth * 0.8,
                    height: screenWidth * 0.8 / 8 * 9
                  }}
                  onPress={() => handlePreview(id)}
                >
                  <Text style={styles.overlayText}>Touch to preview</Text>
                </TouchableOpacity>
              </View>
            )
        }
      </View>
      <Text
        style={{
          ...styles.title,
          width: screenWidth * 0.8
        }}>
        "{title}"
      </Text>
      <Text
        style={styles.details}>
        Composer: {composer}
      </Text>
      <Text
        style={styles.details}>
        Key: {theKey}
      </Text>
      <Text
        style={{
          ...styles.details,
          fontWeight: '400'
        }}>
        Performed by {performer}
      </Text>
      <TouchableOpacity
        onPress={() => handleUse(id)}
        style={styles.button}>
        <Text style={styles.buttonText}>
          Record Duette!
        </Text>
      </TouchableOpacity>
    </View >
  )
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'darkgrey',
    paddingVertical: 10
  },
  title: {
    fontSize: 32,
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '600',
    margin: 2,
    color: 'black'
  },
  details: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '100',
    margin: 1.5,
    color: 'black'
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderRadius: 5,
    marginTop: 15
  },
  overlayText: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '600',
    color: 'black',
  },
  button: {
    marginTop: 12,
    marginBottom: 7,
    paddingHorizontal: 3,
    paddingVertical: 11,
    width: '70%',
    alignSelf: 'center',
    backgroundColor: '#187795',
    borderColor: 'darkgrey',
    borderWidth: 1.5,
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'Gill Sans',
    fontSize: 30,
    fontWeight: '400',
    alignSelf: 'center',
    color: 'white',
  },
  media: {
    borderWidth: 1.5,
    borderColor: '#2589BD',
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 15,
  }
});

export default VideoItem;
