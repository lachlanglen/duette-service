/* eslint-disable complexity */
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Dimensions, Modal } from 'react-native';
import { Camera } from 'expo-camera';

// ANDROID

const RecordAccompaniment = (props) => {
  const {
    setCameraRef,
    handleRecordExit,
    recording,
    startCountdown,
    countdown,
    countdownActive,
    toggleRecord,
    screenOrientation,
    secs,
    deviceType,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const getColor = () => {
    if (!recording) return 'yellow';
    if (secs > 59) return 'green';
    if (secs > 14 && secs <= 59) return 'yellow';
    if (secs <= 14) return 'red';
  }

  return (
    <Modal
      animationType="fade"
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape-right']}
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
            type={Camera.Constants.Type.front}
            ref={ref => setCameraRef(ref)}
          >
            {
              screenOrientation === 'LANDSCAPE' ? (
                <View style={{
                  flexDirection: 'row',
                  height: '100%',
                  width: '100%',
                  justifyContent: 'space-between',
                }}>
                  <View style={{
                    flexDirection: 'column',
                    backgroundColor: 'black',
                    width: '25%',
                    height: '100%',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                    <TouchableOpacity
                      onPress={!recording ? handleRecordExit : () => { }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        // backgroundColor: 'pink',
                        alignItems: 'center',
                        width: '100%',
                      }}>
                        <Text style={{
                          color: 'red',
                          fontSize: recording ? 15 : 20,
                          fontWeight: recording ? 'bold' : 'normal',
                          textAlign: 'center',
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
                              // marginTop: 24,
                            }} />
                        }
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        // backgroundColor: 'purple',
                        alignItems: 'center',
                      }}>
                      <Text style={{
                        color: getColor(),
                        fontSize: 20,
                        fontWeight: secs > 59 ? 'normal' : 'bold',
                      }}>
                        {!recording ? '9 mins max' : `${Math.floor(secs / 60) > 0 ? Math.floor(secs / 60) : ''}:${secs % 60 >= 10 ? secs % 60 : `0${secs % 60}`}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {
                    countdownActive &&
                    <View
                      style={{
                        // backgroundColor: 'green',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '25%',
                        width: '42%',
                        height: '100%',
                        position: 'absolute',
                        marginTop: deviceType === 2 ? screenHeight / 5 : 0,
                      }}>
                      <Text
                        style={{
                          color: '#0047B9',
                          fontSize: deviceType === 2 ? 200 : 110,
                        }}
                      >
                        {countdown}
                      </Text>
                    </View>
                  }
                  <View style={{
                    flexDirection: 'row',
                    backgroundColor: 'black',
                    width: '25%',
                    height: '100%',
                    justifyContent: 'center',
                  }}>
                    <View
                      style={{
                        justifyContent: 'center',
                      }}>
                      <Text style={{
                        color: 'red',
                        // fontSize: 13,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontSize: 14,
                      }}>{recording || countdownActive ? '' : 'record'}
                      </Text>
                      <TouchableOpacity
                        onPress={!recording ? startCountdown : toggleRecord}
                        disabled={countdownActive}
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
                </View>
              ) : (
                  // PORTRAIT ORIENTATION:
                  <View style={{
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      backgroundColor: 'black',
                      width: '100%',
                      height: '18.3%',
                      justifyContent: 'flex-end',
                      paddingBottom: 25,
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        alignItems: 'flex-end',
                        // backgroundColor: 'green',
                        width: '100%'
                      }}>
                        <TouchableOpacity
                          onPress={!recording ? handleRecordExit : () => { }}
                        >
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                              color: 'red',
                              fontSize: recording ? 15 : 20,
                              fontWeight: recording ? 'bold' : 'normal',
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
                                  alignSelf: 'center'
                                }} />
                            }
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            // marginBottom: 30,
                          }}>
                          <Text style={{
                            color: getColor(),
                            fontSize: 20,
                            // paddingTop: 20,
                            // paddingRight: 20,
                            fontWeight: secs > 59 || !recording ? 'normal' : 'bold',
                          }}>
                            {!recording ? '9 mins max' : `${Math.floor(secs / 60) > 0 ? Math.floor(secs / 60) : ''}:${secs % 60 >= 10 ? secs % 60 : `0${secs % 60}`}`}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {
                      countdownActive &&
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: screenWidth,
                          height: screenHeight,
                          position: 'absolute',
                          marginTop: deviceType === 2 ? screenHeight / 5 : 0,
                        }}>
                        <Text
                          style={{
                            color: '#0047B9',
                            fontSize: deviceType === 2 ? 200 : 110,
                          }}
                        >
                          {countdown}
                        </Text>
                      </View>
                    }
                    <View style={{
                      backgroundColor: 'black',
                      width: '100%',
                      height: '18.3%',
                    }}>
                      <Text style={{
                        color: 'red',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontSize: 14,
                        marginVertical: 2,
                      }}>{recording || countdownActive ? '' : 'record'}
                      </Text>
                      <TouchableOpacity
                        onPress={!recording ? startCountdown : toggleRecord}
                        disabled={countdownActive}
                        style={{
                          borderWidth: 5,
                          borderColor: recording ? 'darkred' : 'darkred',
                          alignSelf: 'center',
                          width: 50,
                          height: 50,
                          backgroundColor: recording ? 'black' : 'red',
                          borderRadius: 50,
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
