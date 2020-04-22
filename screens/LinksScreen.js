/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, Dimensions, Image, SafeAreaView, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import { Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { DeviceMotion } from 'expo-sensors';
import { ScreenOrientation } from 'expo';
import { Video } from 'expo-av';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import axios from 'axios';
import { connect } from 'react-redux';
import { setVideo } from '../redux/singleVideo'
import RecordDuetteModal from './RecordDuetteModal';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { loadCats } from '../redux/cats';
import { fetchVideos } from '../redux/videos';

const ViewVids = (props) => {

  const [showRecordDuetteModal, setShowRecordDuetteModal] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');
  const [columnCount, setColumnCount] = useState(1);
  const [previewVid, setPreviewVid] = useState('');
  const [alertCompleted, setAlertCompleted] = useState(false);
  const [bluetooth, setBluetooth] = useState(false);

  let screenWidth = Math.round(Dimensions.get('window').width);
  let screenHeight = Math.round(Dimensions.get('window').height);

  useEffect(() => {
    detectOrientation();
  }, [])

  // if (props.cats && props.cats.length === 0) props.setCats();

  // if (props.videos && props.videos.length === 0) props.fetchVideos();

  const handleBluetooth = (id) => {
    console.log('in handleBluetooth');
    setBluetooth(true);
    setPreviewVid('');
    props.setVideo(id);
    setShowRecordDuetteModal(true);
  }

  const handleWired = (id) => {
    console.log('in handleWired');
    setBluetooth(false);
    setPreviewVid('');
    props.setVideo(id);
    setShowRecordDuetteModal(true);
  }

  const detectOrientation = async () => {
    console.log('in detectOrientation')
    const { orientation } = await ScreenOrientation.getOrientationAsync();
    console.log('orientation: ', orientation)
    setScreenOrientation(orientation.split('_')[0])
    ScreenOrientation.addOrientationChangeListener(info => {
      setScreenOrientation(info.orientationInfo.orientation);
    })
  }

  // console.log('props.selectedVideo: ', props.selectedVideo)

  const handleUse = (id) => {
    console.log('in handleUse')
    Alert.alert(
      'Are you using bluetooth or wired headphones?',
      'This helps us sync your video perfectly 🥰',
      [
        { text: 'Bluetooth', onPress: () => handleBluetooth(id) },
        { text: 'Wired', onPress: () => handleWired(id) },
      ],
      { cancelable: false }
    );
  }

  const handlePreview = (id) => {
    // store video id
    setPreviewVid(id);
  }

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.didJustFinish) setPreviewVid('')
  }

  const setFilteredVideos = text => {
    console.log('text in setFilteredVideos: ', text)
    props.fetchVideos(text);
  }

  const handleSearch = text => {
    console.log('text: ', text);
    setFilteredVideos(text);
  }

  // console.log('props.videos: ', props.videos)

  // console.log('screen orientation: ', screenOrientation)
  // console.log('screenHeight: ', screenHeight, 'screenWidth: ', screenWidth)

  const Item = ({ id, title, composer, theKey, performer, thumbnailUri, videoUri }) => {
    return (
      <View style={styles.item}>
        <View>
          {
            previewVid === id ? (
              <Video
                source={{ uri: videoUri }}
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
                    source={{ uri: thumbnailUri }}
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
        <Text style={{ ...styles.title, width: screenWidth * 0.8 }}>"{title}"</Text>
        <Text style={styles.details}>Composer: {composer}</Text>
        <Text style={styles.details}>Key: {theKey}</Text>
        <Text style={{ ...styles.details, fontWeight: '400' }}>Performed by {performer}</Text>
        <TouchableOpacity onPress={() => handleUse(id)} style={styles.button}><Text style={styles.buttonText}>Record Duette!</Text></TouchableOpacity>
      </View >
    )
  }

  // console.log('selectedVideo in LinksScreen: ', props.selectedVideo)
  // console.log('props.videos.length: ', props.videos.length)

  return (
    showRecordDuetteModal ? (
      // RECORD A DUETTE
      <RecordDuetteModal bluetooth={bluetooth} showRecordDuetteModal={showRecordDuetteModal} setShowRecordDuetteModal={setShowRecordDuetteModal} />
    ) : (
        // VIEW VIDEOS
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFD12B' }}>
          <Searchbar
            placeholder="Title, composer or performer"
            onChangeText={handleSearch}
            style={{ borderRadius: 0, borderBottomColor: 'grey', borderBottomWidth: 2 }}
          // value={}
          />
          {
            props.videos.length > 0 ? (
              <FlatList
                data={props.videos}
                renderItem={({ item }) => <Item id={item.id} title={item.title} thumbnailUri={item.thumbnailUri} performer={item.performer} composer={item.composer} theKey={item.key} videoUri={item.videoUri} />}
                // key={screenOrientation}
                keyExtractor={item => item.id}
                viewabilityConfig={{}}
              />
            ) : (
                // VIDEOS HAVEN'T LOADED
                <View>
                  <Text style={{ marginTop: 10, alignSelf: 'center', fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                    No videos to display
                  </Text>
                </View>
              )
          }
        </SafeAreaView>
      )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  item: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#187795',
    marginVertical: 16,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 5,
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
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: "#DDDDDD",
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
    // borderColor: '#2589BD',
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


const mapState = ({ videos, cats, selectedVideo }) => {
  return {
    videos,
    cats,
    selectedVideo
  }
}

const mapDispatch = dispatch => {
  return {
    setVideo: id => dispatch(setVideo(id)),
    setCats: () => dispatch(loadCats()),
    fetchVideos: (text) => dispatch(fetchVideos(text))
  }
}

export default connect(mapState, mapDispatch)(ViewVids)
