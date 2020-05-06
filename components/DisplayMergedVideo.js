import React, { useState } from 'react';
import { connect } from 'react-redux';
import { View, Modal, Button, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../constants/urls';

const DisplayMergedVideo = (props) => {
  const {
    combinedKey,
    savingToCameraRoll,
    handleSaveToCameraRoll,
    handleRedo
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [screenOrientation, setScreenOrientation] = useState('')

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  }

  return (
    <Modal
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
      onOrientationChange={e => handleModalOrientationChange(e)}>
      <View style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
        backgroundColor: 'black',
        height: '100%'
      }}>
        <View>
          <Video
            source={{ uri: getAWSVideoUrl(combinedKey) }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            isLooping={false}
            useNativeControls={true}
            style={{
              width: screenWidth,
              height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
              marginBottom: 15,
            }}
          />
          <Button
            disabled={savingToCameraRoll}
            title={savingToCameraRoll ? 'Saving to Camera Roll...' : 'Save to Camera Roll'}
            onPress={handleSaveToCameraRoll} />
          <Button
            title="Re-Record"
            onPress={handleRedo} />
        </View>
      </View>
    </Modal>
  )
}

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(DisplayMergedVideo);
