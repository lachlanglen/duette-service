/* eslint-disable complexity */
import React, { Component } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { connect } from 'react-redux';
// import { ScreenOrientation } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';
import { getAWSVideoUrl } from '../constants/urls';

let screenWidth = Math.floor(Dimensions.get('window').width);
let screenHeight = Math.floor(Dimensions.get('window').height);


class RecordDuetteClassModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenOrientation: '',
      showPreviewModal: false,
      vidLoaded: false,
      vidDoneBuffering: false,
      recording: false,
      duetteUri: '',
    };
  }

  async componentDidMount() {
    const { orientation } = await ScreenOrientation.getOrientationAsync();
    this.setState({ screenOrientation: orientation.split('_')[0] });
    ScreenOrientation.addOrientationChangeListener(info => {
      if (info.orientationInfo.orientation === 'UNKNOWN') {
        if (screenWidth > screenHeight) this.setState({ screenOrientation: 'LANDSCAPE' });
        if (screenWidth < screenHeight) this.setState({ screenOrientation: 'portrait' });
      } else {
        this.setState({ screenOrientation: info.orientationInfo.orientation });
      }
    });
  };

  componentWillUnmount() {
    ScreenOrientation.removeOrientationChangeListeners();
  }

  _handleVideoRef = component => {
    this.vidRef = component;
  };

  _handleCameraRef = component => {
    this.cameraRef = component;
  };

  handleCancel = () => {
    this.cameraRef.stopRecording();
    this.vidRef.unloadAsync()
      .then(() => {
        this.props.setShowRecordDuetteModal(false);
      })
      .catch((e) => {
        console.log('error unloading video: ', e);
        this.props.setShowRecordDuetteModal(false);
      });
  };

  handleModalOrientationChange = (ev) => {
    this.setState({ screenOrientation: ev.nativeEvent.orientation.toUpperCase() });
  };

  handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.isLoaded && this.state.vidLoaded === false) {
      console.log('line 75')
      this.setState({ vidLoaded: true });
    }
    else if (!this.state.vidDoneBuffering && updateObj.isBuffering === false) {
      console.log('line 79')
      this.setState({ vidDoneBuffering: true });
    }
  }

  toggleRecord = async () => {
    if (this.state.recording) {
      this.setState({ recording: false });
      this.cameraRef.stopRecording();
    } else {
      try {
        this.setState({ recording: true });
        await this.vidRef.playAsync();
        const vid = await this.cameraRef.recordAsync({ quality: Camera.Constants.VideoQuality['720p'] });
        this.setState({ duetteUri: vid.uri, showPreviewModal: true });
      } catch (e) {
        console.log('error recording: ', e)
      }
    }
  }

  render() {
    console.log('this.state: ', this.state)
    return (
      <View style={styles.container}>
        {
          this.state.showPreviewModal ? (
            <PreviewModal handleCancel={handleCancel} bluetooth={bluetooth} showRecordDuetteModal={showRecordDuetteModal} setShowRecordDuetteModal={setShowRecordDuetteModal} duetteUri={duetteUri} showPreviewModal={showPreviewModal} setShowPreviewModal={setShowPreviewModal} />
          ) : (
              <Modal
                onRequestClose={this.handleCancel}
                supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                onOrientationChange={e => this.handleModalOrientationChange(e)}
              >
                <View style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'black',
                  paddingVertical: this.state.screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
                  height: '100%'
                }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Video
                      ref={this._handleVideoRef}
                      // source={{ uri: 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_480_1_5MG.mp4' }}
                      source={{ uri: getAWSVideoUrl(this.props.selectedVideo.id) }}
                      rate={1.0}
                      volume={1.0}
                      isMuted={false}
                      resizeMode="cover"
                      positionMillis={0}
                      progressUpdateIntervalMillis={50}
                      onPlaybackStatusUpdate={update => this.handlePlaybackStatusUpdate(update)}
                      style={{
                        width: this.state.screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                        height: this.state.screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9
                      }}
                    />
                    {/* TODO: add codec to camera input? (e.g. .mov) */}
                    <Camera
                      style={{
                        width: this.state.screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                        height: this.state.screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9
                      }}
                      type={Camera.Constants.Type.front}
                      ref={this._handleCameraRef}>
                      <View>
                        <TouchableOpacity
                          onPress={!this.state.recording ? this.handleCancel : () => { }}
                        >
                          <Text style={{
                            color: 'red',
                            fontSize: this.state.screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 22,
                            paddingLeft: 20,
                            paddingTop: 20,
                            fontWeight: 'normal'
                          }}
                          >
                            {this.state.recording ? 'Recording' : 'Cancel'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {
                        this.state.vidLoaded && this.state.vidDoneBuffering &&
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            flexDirection: 'row',
                            justifyContent: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={this.toggleRecord}
                            style={{
                              borderWidth: screenWidth / 100,
                              borderColor: this.state.recording ? 'darkred' : 'darkred',
                              alignSelf: 'flex-end',
                              width: screenWidth / 10,
                              height: screenWidth / 10,
                              backgroundColor: this.state.recording ? 'black' : 'red',
                              borderRadius: 50,
                              margin: 10,
                            }}
                          />
                        </View>
                      }
                      {
                        this.state.screenOrientation === 'LANDSCAPE' &&
                        <TouchableOpacity
                          onPress={this.handleCancel}
                          style={{ alignItems: 'center', paddingBottom: 10, height: 30 }}
                        >
                          <Text style={{ color: 'red' }}>Having a problem? Touch here to try again.</Text>
                        </TouchableOpacity>
                      }
                    </Camera>
                  </View>
                  {
                    this.state.screenOrientation === 'PORTRAIT' &&
                    <TouchableOpacity
                      onPress={this.handleCancel}
                    >
                      <Text style={{ color: 'red', marginTop: 20 }}>Having a problem? Touch here to try again.</Text>
                    </TouchableOpacity>
                  }
                </View>
              </Modal >
            )
        }
      </View >
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  overlay: {
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: "#DDDDDD",
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderColor: 'black',
  }
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteClassModal);