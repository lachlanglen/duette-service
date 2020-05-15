import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, SafeAreaView, FlatList, Platform, Dimensions } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { connect } from 'react-redux';
import { setVideo } from '../redux/singleVideo'
import RecordDuetteModalIos from '../components/ios/RecordDuetteModal';
import RecordDuetteModalAndroid from '../components/android/RecordDuetteModal';
import Constants from 'expo-constants';
import * as ScreenOrientation from 'expo-screen-orientation';
import { fetchVideos } from '../redux/videos';
import FacebookSignin from '../components/FacebookSignin';
import UserInfoMenu from '../components/UserInfoMenu';
import VideoItem from '../components/VideoItem';
import LoadingSpinner from '../components/LoadingSpinner';
import EditDetailsModal from '../components/EditDetailsModal';

const DuetteScreen = (props) => {

  const [showRecordDuetteModal, setShowRecordDuetteModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [previewVid, setPreviewVid] = useState('');
  const [bluetooth, setBluetooth] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [screenOrientation, setScreenOrientation] = useState('');

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
    }
    detectOrientation();
  });

  const handleBluetooth = (id) => {
    setBluetooth(true);
    if (previewVid) setPreviewVid('');
    props.setVideo(id);
    setShowRecordDuetteModal(true);
  };

  const handleWired = (id) => {
    setBluetooth(false);
    if (previewVid) setPreviewVid('');
    props.setVideo(id);
    setShowRecordDuetteModal(true);
  };

  const handleUse = (id) => {
    Alert.alert(
      'Are you using bluetooth or wired headphones?',
      `This helps us sync your video perfectly${Platform.OS === 'ios' ? ` 🥰` : `!`}`,
      [
        { text: 'Bluetooth', onPress: () => handleBluetooth(id) },
        { text: 'Wired', onPress: () => handleWired(id) },
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
                      />
                    )
                }
              </View>
            ) : (
                // VIEW VIDEOS
                <SafeAreaView style={styles.listContainer}>
                  {
                    props.displayUserInfo &&
                    <UserInfoMenu />
                  }
                  <Searchbar
                    placeholder="Title, composer or performer"
                    onChangeText={handleSearch}
                    style={styles.searchbar}
                  />
                  {
                    !searchText ? (
                      <View>
                        <Text style={styles.text}>
                          {"Search for a base track by title, composer, performer &/or key!"}
                        </Text>
                      </View>
                    ) : (
                        // SEARCH YIELDED NO RESULTS
                        props.videos.length > 0 ? (
                          < FlatList
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
                                showEditDetailsModal={showEditDetailsModal} />
                            )}
                            keyExtractor={item => item.id}
                            viewabilityConfig={{}}
                          />
                        ) : (
                            <View>
                              <Text style={styles.text}>
                                No base tracks found matching "{searchText}" 😿
                              </Text>
                            </View>
                          )
                      )
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
    backgroundColor: '#FFD12B',
  },
  searchbar: {
    borderRadius: 0,
    borderBottomColor: 'grey',
    borderBottomWidth: 2,
  },
  text: {
    marginTop: 10,
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});


const mapState = ({ videos, cats, selectedVideo, displayUserInfo, user, dataLoaded }) => {
  return {
    videos,
    cats,
    selectedVideo,
    user,
    displayUserInfo,
    dataLoaded,
  }
}

const mapDispatch = dispatch => {
  return {
    setVideo: id => dispatch(setVideo(id)),
    fetchVideos: (text) => dispatch(fetchVideos(text))
  }
}

export default connect(mapState, mapDispatch)(DuetteScreen);
