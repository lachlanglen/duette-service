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
    toggleRecord,
    secs,
    setSecs,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [screenOrientation, setScreenOrientation] = useState('');

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  };

  const getColor = () => {
    if (!recording) return 'yellow';
    if (secs > 59) return 'green';
    if (secs > 14 && secs <= 59) return 'yellow';
    if (secs <= 14) return 'red';
  }

  return (
    <Modal
      animationType="fade"
      onOrientationChange={e => handleModalOrientationChange(e)}
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape-right']}
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={handleRecordExit}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{
                    color: 'red',
                    fontSize: recording ? 15 : 20,
                    paddingLeft: 20,
                    paddingTop: 20,
                    fontWeight: recording ? 'bold' : 'normal'
                  }}
                  >
                    {recording ? 'REC' : 'Cancel'}
                  </Text>
                  {
                    recording &&
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: 'red',
                        borderRadius: 50,
                        marginLeft: 7,
                        marginTop: 24,
                      }} />
                  }
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginBottom: 30 }}>
                <Text style={{
                  color: getColor(),
                  fontSize: 20,
                  paddingTop: 20,
                  paddingRight: 20,
                  fontWeight: secs > 59 ? 'normal' : 'bold',
                }}>
                  {!recording ? '9 mins max' : `${Math.floor(secs / 60) > 0 ? Math.floor(secs / 60) : ''}:${secs % 60 >= 10 ? secs % 60 : `0${secs % 60}`}`}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}>
              <Text style={{
                color: 'red',
                // fontSize: 13,
                fontWeight: 'bold',
                textAlign: 'center',
                textTransform: 'uppercase',
                fontSize: 14,
              }}>{recording ? '' : 'record'}</Text>
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
          </Camera>
        </View>
      </View>
    </Modal>
  )
}

export default RecordAccompaniment;
