/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { View, Modal, Button, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Permissions } from 'expo'
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import uuid from 'react-native-uuid';

const DisplayMergedVideo = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const { mergedLocalUri, displayMergedVideo, setDisplayMergedVideo } = props;

  const handleExit = () => {
    console.log('preview modal exited')
  }

  const handleBack = () => {
    setDisplayMergedVideo(false)
  }

  const handleSave = () => {
    console.log('in handleSave!')
  }

  return (
    // <View style={styles.container}>
    <Modal
      onRequestClose={handleExit}
      supportedOrientations={['landscape', 'portrait']}
      style={styles.container}
    >
      <View style={{ flexDirection: 'row' }}>
        <Video
          source={{ uri: mergedLocalUri }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay
          isLooping={false}
          style={{ width: screenWidth, height: screenWidth / 16 * 9 }}
        />
      </View>
      <Button title='Save' onPress={handleSave}></Button>
      <Button title='Redo' onPress={handleBack}></Button>
      <Button title='Back' onPress={() => setDisplayMergedVideo(false)}></Button>
    </Modal >
    // </View>
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

export default connect(mapState)(DisplayMergedVideo);

      // export default withRouter(DisplayMergedVideo);
