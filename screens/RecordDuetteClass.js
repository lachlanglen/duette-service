import React, { Component } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { ScreenOrientation } from 'expo';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';

let screenWidth = Math.floor(Dimensions.get('window').width);
let screenHeight = Math.floor(Dimensions.get('window').height);


class RecordDuetteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenOrientation: '',
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
    })
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Modal
          supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
        >
          <View style={{
            flexDirection: 'column',
          }}>
            <View style={{ flexDirection: 'row' }}>
              <Text>Hi</Text>
              {/* <Video
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                // positionMillis={0}
                source={{ uri: this.props.selectedVideo.videoUri }}
                style={{
                  width: this.state.screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                  height: this.state.screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9
                }}
              />
              <Camera
                style={{
                  width: this.state.screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                  height: this.state.screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9
                }}
                type={Camera.Constants.Type.front}
              >
                <View>
                  <TouchableOpacity>
                    <Text style={{
                      color: 'red',
                      fontSize: this.state.screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 22,
                      paddingLeft: 20,
                      paddingTop: 20,
                      fontWeight: 'normal'
                    }}
                    >
                      Recording
                  </Text>
                  </TouchableOpacity>
                </View>
              </Camera> */}
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteModal);