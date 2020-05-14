import React, { useState } from 'react';
import { connect } from 'react-redux';
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
  const {
    videoId,
    duetteId,
    videoTitle,
    selectedDuette,
    setSelectedDuette,
    showPreview,
    setShowPreview,
  } = props;

  const [savingToCameraRoll, setSavingToCameraRoll] = useState(false);

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

  const handlePreview = () => {
    setSelectedDuette(duetteId);
    setShowPreview(true);
  };

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.didJustFinish) {
      setShowPreview(false);
      setSelectedDuette('');
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        marginVertical: 10,
        marginHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'darkgrey',
        paddingVertical: 10,
        height: screenWidth / 16 * 9 + 50,
        width: screenWidth - 30,
        alignItems: 'center',
      }}>
      <Video
        source={{ uri: getAWSVideoUrl(combinedKey) }}
        shouldPlay={selectedDuette === duetteId && showPreview}
        onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
        style={{
          width: screenWidth * 0.85,
          height: screenWidth * 0.85 / 16 * 9,
          borderRadius: 10,
        }} />
      {
        duetteId !== selectedDuette &&
        <TouchableOpacity
          onPress={handlePreview}
          style={{
            marginTop: 10,
            width: screenWidth * 0.85,
            height: screenWidth * 0.85 / 16 * 9,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.5,
            position: 'absolute',
            borderRadius: 10,
          }} >
          {videoTitle &&
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'black',
              }}>{videoTitle}
            </Text>
          }
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'darkgrey',
            }}
          >Touch to preview
            </Text>
        </TouchableOpacity>
      }
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          onPress={() => handleSaveToCameraRoll(duetteId, combinedKey)}
          disabled={savingToCameraRoll}
          style={{
            ...buttonStyles.regularButton,
            width: screenWidth * 0.85,
            marginTop: 10,
            backgroundColor: savingToCameraRoll ? 'lightgrey' : '#187795',
            borderColor: savingToCameraRoll ? 'white' : 'darkblue',
          }}>
          <Text style={{
            ...buttonStyles.regularButtonText,
            fontWeight: 'normal',
          }}>Save to Camera Roll
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
};

const mapState = ({ videos }) => {
  return {
    videos,
  }
}

export default connect(mapState)(MyDuettesItem);
