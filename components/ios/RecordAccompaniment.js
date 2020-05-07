/* eslint-disable complexity */
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Dimensions, Modal } from 'react-native';
import { Camera } from 'expo-camera';

// iOS

const RecordAccompaniment = (props) => {
  const {
    setCameraRef,
    handleRecordExit,
    recording,
    toggleRecord
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [screenOrientation, setScreenOrientation] = useState('')

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  }

  return (
    <Modal
      animationType="fade"
      onOrientationChange={e => handleModalOrientationChange(e)}
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <View style={{
        flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0
      }}>
        <View
          style={{
            width: screenOrientation === 'PORTRAIT' ? screenWidth : screenHeight / 9 * 8,
            height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 9 : screenHeight
          }}>
          <Camera
            style={{
              width: '100%',
              height: '100%'
            }}
            type={Camera.Constants.Type.front} ref={ref => setCameraRef(ref)}>
            <View>
              <TouchableOpacity
                onPress={handleRecordExit}
              >
                <Text style={{
                  color: 'red',
                  fontSize: recording ? 15 : 20,
                  paddingLeft: 20,
                  paddingTop: 20,
                  fontWeight: recording ? 'bold' : 'normal'
                }}
                >
                  {recording ? 'Recording' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={toggleRecord}
                style={{
                  borderWidth: 5,
                  borderColor: recording ? 'darkred' : 'darkred',
                  alignSelf: 'flex-end',
                  width: 50,
                  height: 50,
                  backgroundColor: recording ? 'black' : 'red',
                  borderRadius: 50,
                  margin: 10,
                }}
              />
            </View>
          </Camera>
        </View>
      </View>
    </Modal>
  )
}

export default RecordAccompaniment;
