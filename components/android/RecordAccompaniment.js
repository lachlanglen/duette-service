/* eslint-disable complexity */
import React from 'react';
import { Text, TouchableOpacity, View, Dimensions, Modal } from 'react-native';
import { Camera } from 'expo-camera';

// ANDROID

const RecordAccompaniment = (props) => {
  const {
    setCameraRef,
    handleRecordExit,
    recording,
    toggleRecord,
    screenOrientation,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  return (
    <Modal
      animationType="fade"
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <View style={{
        flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
        height: '100%',
      }}>
        <View
          style={{
            width: screenOrientation === 'PORTRAIT' ? screenWidth : screenHeight / 9 * 16 * 0.9,
            height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 16 * 0.9 : screenHeight * 0.9,
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: 'black',
          }}
        >
          <Camera
            style={{
              width: '100%',
              height: '100%',
            }}
            ratio="16:9"
            type={Camera.Constants.Type.front} ref={ref => setCameraRef(ref)}>
            {
              screenOrientation === 'LANDSCAPE' ? (
                <View style={{ flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'space-between' }}>
                  <View style={{ backgroundColor: 'black', width: '25%', height: '100%', justifyContent: 'center' }}>
                    <TouchableOpacity
                      onPress={handleRecordExit}
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
                  <View style={{ flexDirection: 'row', backgroundColor: 'black', width: '25%', height: '100%', justifyContent: 'center' }}>
                    <TouchableOpacity
                      onPress={toggleRecord}
                      style={{
                        borderWidth: 5,
                        borderColor: recording ? 'darkred' : 'darkred',
                        alignSelf: 'center',
                        width: 50,
                        height: 50,
                        backgroundColor: recording ? 'black' : 'red',
                        borderRadius: 50,
                        margin: 10,
                      }}
                    />
                  </View>
                </View>
              ) : (
                  <View style={{ flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'space-between' }}>
                    <View style={{ backgroundColor: 'black', width: '100%', height: '18.3%', justifyContent: 'flex-end', paddingBottom: 25 }}>
                      <TouchableOpacity
                        onPress={handleRecordExit}
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
                    <View style={{ backgroundColor: 'black', width: '100%', height: '18.3%' }}>
                      <TouchableOpacity
                        onPress={toggleRecord}
                        style={{
                          borderWidth: 5,
                          borderColor: recording ? 'darkred' : 'darkred',
                          alignSelf: 'center',
                          marginTop: 20,
                          width: 50,
                          height: 50,
                          backgroundColor: recording ? 'black' : 'red',
                          borderRadius: 50,
                          margin: 10,
                        }}
                      />
                    </View>
                  </View>
                )
            }
          </Camera>
        </View>
      </View>
    </Modal>
  )
}

export default RecordAccompaniment;
