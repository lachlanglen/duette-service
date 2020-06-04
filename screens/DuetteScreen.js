import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, SafeAreaView, FlatList, Platform, Dimensions } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { connect } from 'react-redux';
import { setVideo } from '../redux/singleVideo'
import RecordDuetteModalIos from '../components/ios/RecordDuetteModal';
import RecordDuetteModalAndroid from '../components/android/RecordDuetteModal';
import Constants from 'expo-constants';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';
import * as Device from 'expo-device';
import { fetchVideos } from '../redux/videos';
import FacebookSignin from '../components/FacebookSignin';
import UserInfoMenu from '../components/UserInfoMenu';
import VideoItem from '../components/VideoItem';
import LoadingSpinner from '../components/LoadingSpinner';
import EditDetailsModal from '../components/EditDetailsModal';
import { getAWSVideoUrl } from '../constants/urls';

const DuetteScreen = (props) => {

  const [showRecordDuetteModal, setShowRecordDuetteModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [previewVid, setPreviewVid] = useState('');
  const [bluetooth, setBluetooth] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [screenOrientation, setScreenOrientation] = useState('');
  const [baseTrackUri, setBaseTrackUri] = useState('');
  const [loading, setLoading] = useState({ isLoading: false, id: '' });
  const [deviceType, setDeviceType] = useState(null);

  let screenWidth = Math.round(Dimensions.get('window').width);
  let screenHeight = Math.round(Dimensions.get('window').height);

  useEffect(() => {
    const detectOrientation = () => {
      if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
      if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
      ScreenOrientation.addOrientationChangeListener(info => {
        if (info.orientationInfo.orientation === 'UNKNOWN') {
          if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
          if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
        } else {
          if (info.orientationInfo.orientation === 1 || info.orientationInfo.orientation === 2) setScreenOrientation('PORTRAIT');
          if (info.orientationInfo.orientation === 3 || info.orientationInfo.orientation === 4) setScreenOrientation('LANDSCAPE');
        }
      })
    };
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    detectOrientation();
    getDeviceType();
  });

  const loadVideo = async (bluetooth, id) => {
    // TODO: show error if not enough storage available?
    setLoading({ isLoading: true, id });
    if (previewVid) setPreviewVid('');
    if (bluetooth) {
      setBluetooth(true);
    } else {
      setBluetooth(false);
    }
    props.setVideo(id);
    try {
      const { uri } = await FileSystem.downloadAsync(
        getAWSVideoUrl(id),
        FileSystem.documentDirectory + `${id}.mov`
      );
      setBaseTrackUri(uri);
      setLoading({ isLoading: false, id: '' });
      setShowRecordDuetteModal(true);
    } catch (e) {
      Alert.alert(
        'Oops...',
        `We encountered a problem downloading this base track. Please check your internet connection and try again.`,
        [
          { text: 'OK', onPress: () => setLoading({ isLoading: false, id: '' }) },
        ],
        { cancelable: false }
      );
      const freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();
      const freeDiskStorageMb = freeDiskStorage / 1000000;
      throw new Error(`error in loadVideo. ${freeDiskStorageMb}MB available. error: `, e)
    }
  }

  const handleUse = (id) => {
    Alert.alert(
      'Are you using bluetooth or wired headphones?',
      `This helps us sync your video perfectly${Platform.OS === 'ios' && deviceType !== 2 ? ` 🥰` : `!`}`,
      [
        { text: 'Bluetooth', onPress: () => loadVideo(true, id) },
        { text: 'Wired', onPress: () => loadVideo(false, id) },
      ],
      { cancelable: false }
    );
  };

  const handlePreview = (id) => {
    setPreviewVid(id);
  };

  const setFilteredVideos = text => {
    props.fetchVideos(text);
  };

  const handleSearch = text => {
    setSearchText(text);
    setFilteredVideos(text);
  };

  return (
    !props.user.id ? (
      !props.dataLoaded ? (
        <LoadingSpinner />
      ) : (
          <FacebookSignin />
        )
    ) : (
        showEditDetailsModal && props.selectedVideo.id ? (
          <EditDetailsModal
            id={props.selectedVideo.id}
            setShowEditDetailsModal={setShowEditDetailsModal}
            origTitle={props.selectedVideo.title}
            origComposer={props.selectedVideo.composer}
            origSongKey={props.selectedVideo.key}
            origPerformer={props.selectedVideo.performer}
            origNotes={props.selectedVideo.notes}
            setSearchText={setSearchText}
            searchText={searchText}
          />
        ) : (
            showRecordDuetteModal ? (
              // RECORD A DUETTE
              <View style={styles.container}>
                {
                  Platform.OS === 'android' ? (
                    <RecordDuetteModalAndroid
                      bluetooth={bluetooth}
                      setShowRecordDuetteModal={setShowRecordDuetteModal}
                      screenOrientation={screenOrientation}
                    />
                  ) : (
                      <RecordDuetteModalIos
                        bluetooth={bluetooth}
                        setShowRecordDuetteModal={setShowRecordDuetteModal}
                        baseTrackUri={baseTrackUri}
                        setSearchText={setSearchText}
                      />
                    )
                }
              </View>
            ) : (
                // VIEW VIDEOS
                <SafeAreaView style={styles.listContainer}>
                  <Searchbar
                    placeholder="Try 'No Such Thing'"
                    onChangeText={handleSearch}
                    style={styles.searchbar}
                  />
                  {
                    !searchText ? (
                      <View>
                        <Text style={styles.text}>
                          {"Search for a base track by title, composer, performer or key!"}
                        </Text>
                      </View>
                    ) : (
                        // SEARCH YIELDED NO RESULTS
                        props.videos.length > 0 ? (
                          <View style={{ flex: 1, paddingBottom: 10 }}>
                            <FlatList
                              data={props.videos}
                              renderItem={({ item }) => (
                                <VideoItem
                                  id={item.id}
                                  title={item.title}
                                  performer={item.performer}
                                  composer={item.composer}
                                  theKey={item.key}
                                  userId={item.userId}
                                  previewVid={previewVid}
                                  setPreviewVid={setPreviewVid}
                                  handlePreview={handlePreview}
                                  handleUse={handleUse}
                                  setShowEditDetailsModal={setShowEditDetailsModal}
                                  showEditDetailsModal={showEditDetailsModal}
                                  loading={loading}
                                  searchText={searchText}
                                />
                              )}
                              keyExtractor={item => item.id}
                              viewabilityConfig={{}}
                            />
                          </View>
                        ) : (
                            <View>
                              <Text style={styles.text}>
                                No base tracks found matching "{searchText}" 😿
                              </Text>
                            </View>
                          )
                      )
                  }
                  {
                    props.displayUserInfo &&
                    <UserInfoMenu />
                  }
                </SafeAreaView>
              )
          )
      )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#ffd12b',
  },
  searchbar: {
    borderRadius: 0,
    borderBottomColor: 'grey',
    borderBottomWidth: 2,
  },
  text: {
    marginTop: 10,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0047b9',
  },
});


const mapState = ({ videos, cats, selectedVideo, displayUserInfo, user, dataLoaded, error }) => {
  return {
    videos,
    cats,
    selectedVideo,
    user,
    displayUserInfo,
    dataLoaded,
    error,
  }
}

const mapDispatch = dispatch => {
  return {
    setVideo: id => dispatch(setVideo(id)),
    fetchVideos: (text) => dispatch(fetchVideos(text))
  }
}

export default connect(mapState, mapDispatch)(DuetteScreen);
