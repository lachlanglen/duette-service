import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Text, View, SafeAreaView, FlatList, Alert, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../constants/urls';
import buttonStyles from '../styles/button';

const MyDuettes = (props) => {

  const [savingToCameraRoll, setSavingToCameraRoll] = useState(false);

  const saveVideo = async (key) => {
    try {
      const { uri } = await FileSystem.downloadAsync(
        getAWSVideoUrl(key),
        FileSystem.documentDirectory + `${key}.mov`
      )
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert(
          'Saved!',
          'This Duette has been saved to your Camera Roll',
          [
            { text: 'OK', onPress: () => setSavingToCameraRoll(false) },
          ],
          { cancelable: false }
        );
      } catch (e) {
        setSavingToCameraRoll(false);
        Alert.alert(
          `We're sorry`,
          'This video could not be saved to your camera roll at this time.',
          [
            { text: 'OK', onPress: () => setSavingToCameraRoll(false) },
          ],
          { cancelable: false }
        )
        throw new Error('error saving to camera roll: ', e);
      }
    } catch (e) {
      setSavingToCameraRoll(false);
      Alert.alert(
        `We're sorry`,
        'This video could not be saved to your camera roll at this time.',
        [
          { text: 'OK', onPress: () => setSavingToCameraRoll(false) },
        ],
        { cancelable: false }
      )
      throw new Error('error downloading to local file: ', e);
    }
  };

  const handleSaveToCameraRoll = async (combinedKey) => {
    setSavingToCameraRoll(true);
    const permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status !== 'granted') {
      const newPermission = await MediaLibrary.requestPermissionsAsync();
      if (newPermission.status === 'granted') {
        saveVideo(combinedKey);
      } else {
        Alert.alert(
          'Camera Roll',
          'We need your permission to save to your Camera Roll!',
          [
            { text: 'OK', onPress: () => setSavingToCameraRoll(false) },
          ],
          { cancelable: false }
        );
      }
    } else {
      saveVideo(combinedKey);
    }
  };

  const ListItem = ({ duetteId, videoId }) => {
    const combinedKey = `${videoId}${duetteId}`;
    return (
      // TODO: fix styling (too much vertical padding)
      <View style={{
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Video
          source={{ uri: getAWSVideoUrl(combinedKey) }}
          style={{ width: 180, height: 320 }} />
        <TouchableOpacity
          onPress={() => handleSaveToCameraRoll(combinedKey)}
          disabled={savingToCameraRoll}
          style={{
            ...buttonStyles.regularButton,
            width: 100,
            marginLeft: 20,
            backgroundColor: savingToCameraRoll ? 'lightgrey' : '#0047B9',
            borderColor: savingToCameraRoll ? 'white' : 'darkblue',
          }}>
          <Text style={{
            ...buttonStyles.regularButtonText,
            fontWeight: 'normal',
          }}>Save
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={props.userDuettes}
        renderItem={({ item }) => (
          <ListItem
            duetteId={item.id}
            videoId={item.videoId}
          />
        )}
        keyExtractor={item => item.id}
        viewabilityConfig={{}}
      />
    </SafeAreaView>
  )
};

const mapState = ({ userDuettes }) => {
  return {
    userDuettes,
  }
}

export default connect(mapState)(MyDuettes);
