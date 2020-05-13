import React, { useState } from 'react';
import { Alert, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../constants/urls';
import buttonStyles from '../styles/button';
import { setAdvertiserIDCollectionEnabledAsync } from 'expo-facebook';

let screenWidth = Math.round(Dimensions.get('window').width);
let screenHeight = Math.round(Dimensions.get('window').height);

const MyDuettesItem = props => {
  const { videoId, duetteId } = props;

  const [savingToCameraRoll, setSavingToCameraRoll] = useState(false);
  const [selectedDuette, setSelectedDuette] = useState('');

  const combinedKey = `${videoId}${duetteId}`;

  const handleExitAlert = () => {
    setSavingToCameraRoll(false);
    setSelectedDuette('');
  };

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
            { text: 'OK', onPress: handleExitAlert() },
          ],
          { cancelable: false }
        );
      } catch (e) {
        Alert.alert(
          `We're sorry`,
          'This video could not be saved to your camera roll at this time.',
          [
            { text: 'OK', onPress: () => handleExitAlert() },
          ],
          { cancelable: false }
        )
        throw new Error('error saving to camera roll: ', e);
      }
    } catch (e) {
      Alert.alert(
        `We're sorry`,
        'This video could not be saved to your camera roll at this time.',
        [
          { text: 'OK', onPress: () => handleExitAlert() },
        ],
        { cancelable: false }
      )
      throw new Error('error downloading to local file: ', e);
    }
  };

  const handleSaveToCameraRoll = async (duetteId, combinedKey) => {
    setSavingToCameraRoll(true);
    setSelectedDuette(duetteId);
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

  return (
    // TODO: fix styling (too much vertical padding)
    <View
      key={duetteId}
      style={{
        padding: 10,
        flexDirection: 'row',
        alignItems: 'space-between',
        justifyContent: 'space-between',
        width: '100%',
        height: screenWidth / 32 * 9 + 20,
        backgroundColor: 'pink',
        borderWidth: 1,
        borderColor: 'black',
      }}>
      <View style={{
        width: screenWidth / 2,
        height: screenWidth / 32 * 9,
        backgroundColor: 'red',
      }}>
        {/* <Video
          source={{ uri: getAWSVideoUrl(combinedKey) }}
          shouldPlay={selectedDuette === duetteId}
          style={{ width: '100%', height: '100%' }} /> */}
        <TouchableOpacity style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'orange'
        }} />
      </View>
      <View style={{
        justifyContent: 'center',
        height: '100%',
        width: screenWidth / 2,
      }}>
        <TouchableOpacity
          onPress={() => handleSaveToCameraRoll(duetteId, combinedKey)}
          disabled={savingToCameraRoll}
          style={{
            ...buttonStyles.regularButton,
            width: 100,
            marginBottom: 0,
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
    </View>
  )
};

export default MyDuettesItem;
