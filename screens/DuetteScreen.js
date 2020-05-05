import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, SafeAreaView, FlatList } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { connect } from 'react-redux';
import { setVideo } from '../redux/singleVideo'
import RecordDuetteModal from './RecordDuetteModal';
import Constants from 'expo-constants';
import { fetchVideos } from '../redux/videos';
import FacebookSignin from '../components/FacebookSignin';
import UserInfoMenu from '../components/UserInfoMenu';
import VideoItem from '../components/VideoItem';

const DuetteScreen = (props) => {

  const [showRecordDuetteModal, setShowRecordDuetteModal] = useState(false);
  const [previewVid, setPreviewVid] = useState('');
  const [bluetooth, setBluetooth] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleBluetooth = (id) => {
    setBluetooth(true);
    setPreviewVid('');
    props.setVideo(id);
    setShowRecordDuetteModal(true);
  }

  const handleWired = (id) => {
    setBluetooth(false);
    setPreviewVid('');
    props.setVideo(id);
    setShowRecordDuetteModal(true);
  }

  const handleUse = (id) => {
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
    setPreviewVid(id);
  }

  const setFilteredVideos = text => {
    props.fetchVideos(text);
  }

  const handleSearch = text => {
    setSearchText(text);
    setFilteredVideos(text);
  }

  return (
    !props.user.id ? (
      // send to facebook signin & store accessToken, expires & facebookId on secure store
      <FacebookSignin />
    ) : (
        showRecordDuetteModal ? (
          // RECORD A DUETTE
          <View style={styles.container}>
            <RecordDuetteModal bluetooth={bluetooth} showRecordDuetteModal={showRecordDuetteModal} setShowRecordDuetteModal={setShowRecordDuetteModal} />
          </View>
        ) : (
            // VIEW VIDEOS
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFD12B' }}>
              {
                props.displayUserInfo &&
                <UserInfoMenu />
              }
              <Searchbar
                placeholder="Title, composer or performer"
                onChangeText={handleSearch}
                style={{ borderRadius: 0, borderBottomColor: 'grey', borderBottomWidth: 2 }}
              />
              {
                props.videos.length > 0 ? (
                  <FlatList
                    data={props.videos}
                    renderItem={({ item }) => (<VideoItem
                      id={item.id}
                      title={item.title}
                      performer={item.performer}
                      composer={item.composer}
                      theKey={item.key}
                      previewVid={previewVid}
                      setPreviewVid={setPreviewVid}
                      handlePreview={handlePreview}
                      handleUse={handleUse} />
                    )}
                    keyExtractor={item => item.id}
                    viewabilityConfig={{}}
                  />
                ) : (
                    // VIDEOS HAVEN'T LOADED
                    !searchText ? (
                      <View>
                        <Text style={{ marginTop: 10, alignSelf: 'center', fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                          Loading...
                        </Text>
                      </View>
                    ) : (
                        <View>
                          <Text style={{ marginTop: 10, alignSelf: 'center', fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                            No videos to display
                          </Text>
                        </View>
                      )
                  )
              }
            </SafeAreaView>
          )
      )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});


const mapState = ({ videos, cats, selectedVideo, displayUserInfo, user }) => {
  return {
    videos,
    cats,
    selectedVideo,
    user,
    displayUserInfo
  }
}

const mapDispatch = dispatch => {
  return {
    setVideo: id => dispatch(setVideo(id)),
    fetchVideos: (text) => dispatch(fetchVideos(text))
  }
}

export default connect(mapState, mapDispatch)(DuetteScreen);

