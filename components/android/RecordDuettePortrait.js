/* eslint-disable complexity */
import React from 'react';
import { connect } from 'react-redux';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../../constants/urls';

const RecordDuettePortrait = (props) => {
  const {
    recording,
    handleCancel,
    setVidRef,
    handlePlaybackStatusUpdate,
    screenOrientation,
    setCameraRef,
    toggleRecord,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  return (
    <View style={{
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
      height: '100%'
    }}>
      <View style={{
        alignSelf: 'flex-start',
        justifyContent: 'center',
        // backgroundColor: 'black',
        height: '15%',
        width: '50%'
      }}>
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
        style={{
          flexDirection: 'row',
          backgroundColor: 'red',
          height: screenWidth / 9 * 8,
          width: '100%',
        }}>
        <View style={{
          height: '100%',
          width: '50%',
          backgroundColor: 'black'
        }}>
          <View style={{
            height: (screenWidth / 9 * 8 - screenWidth / 16 * 9) / 2,
            width: '100%',
            backgroundColor: 'black'
          }} />
          <Video
            ref={ref => setVidRef(ref)}
            source={{ uri: getAWSVideoUrl(props.selectedVideo.id) }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            progressUpdateIntervalMillis={50}
            onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
            style={{
              width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
              height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
            }}
          />
        </View>
        <View style={{
          height: '100%',
          width: '50%',
          backgroundColor: 'black'
        }}>
          {/* TODO: add codec to camera input? (e.g. .mov) */}
          <Camera
            style={{
              width: '100%',
              height: '100%',
              alignSelf: 'center',
            }}
            ratio="16:9"
            type={Camera.Constants.Type.front}
            ref={ref => setCameraRef(ref)} >
            <View style={{
              height: '100%',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <View style={{
                height: (screenWidth / 9 * 8 - screenWidth / 16 * 9) / 2,
                width: '100%',
                backgroundColor: 'black'
              }} />
              <View style={{
                height: (screenWidth / 9 * 8 - screenWidth / 16 * 9) / 2,
                width: '100%',
                backgroundColor: 'black'
              }} />
            </View>
          </Camera>
        </View>
      </View>
      <View style={{ backgroundColor: 'black', height: '15%', width: '50%' }}>
        <View style={{ backgroundColor: 'black', width: '100%', height: '18.3%', justifyContent: 'flex-end' }}>
          <TouchableOpacity
            onPress={toggleRecord}
          >
            <Text style={{
              color: 'red',
              fontSize: 13,
              fontWeight: 'bold',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
            >
              {recording ? '' : 'record'}
            </Text>
          </TouchableOpacity>
        </View>
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
      {
        recording &&
        <TouchableOpacity
          onPress={handleCancel}
        >
          <Text style={{ color: 'red', marginTop: 20, width: '100%' }}>Having a problem? Touch here to try again.</Text>
        </TouchableOpacity>
      }
    </View>
  )
};

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuettePortrait);
