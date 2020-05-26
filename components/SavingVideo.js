import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Text, View, Button, Vibration, Platform, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Notifications } from 'expo';
import * as SecureStore from 'expo-secure-store';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
// import ws from '../config/index';
import axios from 'axios';

const SavingVideo = (props) => {

  const {
    dataUri,
    duetteUri,
    setSuccess,
    setSaving,
    title,
    composer,
    songKey,
    performer,
    notes,
    handleExit,
    type,
    customOffset,
    playDelay,
    date1,
    date2,
  } = props;

  // console.log('props in SavingVideo: ', props)

  let tempVidId;
  let ws;
  let expoPushToken = null;

  useEffect(() => {
    createConnection();
    handlePost();
  }, []);

  const createConnection = () => {
    ws = new WebSocket("wss://pi518guoyc.execute-api.us-east-2.amazonaws.com/test");
    ws.onopen = () => {
      console.log('Start Connection');
    };
    ws.onmessage = e => {
      const data = JSON.parse(e.data).data;
      console.log('message: ', data)
    };
    ws.onerror = e => {
      console.log('onerror', e.message);
    };
    ws.onclose = e => {
      console.log('onclose', e.code, e.reason);
    };
  };

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      handleSendToWebsocket();
    }
    const token = await Notifications.getExpoPushTokenAsync();
    console.log(token);
    expoPushToken = token;
    handleSendToWebsocket();
  };

  const handleFinish = () => {
    setSuccess(true);
    setSaving(false);
  }

  const handleSendToWebsocket = () => {
    if (ws.readyState === 2 || ws.readyState === 3) createConnection();
    if (type === 'duette') {
      const duetteKey = tempVidId;
      const accompanimentKey = props.selectedVideo.id;
      ws.send(JSON.stringify({
        type: 'duette',
        inputBucket: 'duette',
        outputBucket: 'duette',
        accompanimentKey,
        duetteKey,
        delay: (customOffset + playDelay + 50 + (date2 - date1)) / 1000,
        userId: props.user.id,
        notificationToken: expoPushToken,
        email: props.user.email,
        name: props.user.name.split(' ')[0],
        sendEmails: props.user.sendEmails,
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'base track',
        inputBucket: 'duette',
        outputBucket: 'duette',
        key: tempVidId,
        title,
        composer,
        songKey,
        performer,
        notes,
        userId: props.user.id,
        notificationToken: expoPushToken,
        email: props.user.email,
        name: props.user.name.split(' ')[0],
        sendEmails: props.user.sendEmails,
      }));
    }
    handleExit();
  }

  const handlePost = async () => {
    tempVidId = uuid.v4();
    let uriParts = type === 'base track' ? dataUri.split('.') : duetteUri.split('.');
    let fileType = uriParts[uriParts.length - 1];
    const vidFile = {
      uri: type === 'base track' ? dataUri : duetteUri,
      name: `${tempVidId}.mov`,
      type: `video/${fileType}`
    }
    try {
      const signedUrl = (await axios.get(`https://duette.herokuapp.com/api/aws/getSignedUrl/${tempVidId}.mov`)).data;
      const awsOptions = {
        method: 'PUT',
        body: vidFile,
        headers: {
          Accept: 'application/json',
          'Content-Type': `video/${fileType}`,
        },
      };
      await fetch(signedUrl, awsOptions);
      Alert.alert(
        "We're saving your video!",
        `We'll send you a notification when your ${type === 'base track' ? type : 'Duette'} has finished processing.`,
        [
          { text: 'OK', onPress: () => registerForPushNotificationsAsync() },
        ],
        { cancelable: false }
      );
    } catch (e) {
      throw new Error('error in handlePost: ', e)
    }
  };

  return (
    <View
      style={styles.container}>
      <Text style={styles.titleTextBlue}>Uploading Video...</Text>
      <Text style={styles.importantTextRed}>Important:</Text>
      <Text style={styles.importantTextRed}>Please do not leave this screen!</Text>
      <ActivityIndicator size="large" color="#0047B9" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titleTextBlue: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  importantTextRed: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
    color: 'red'
  },
  timeRemainingText: {
    marginVertical: 20,
    fontSize: 15,
  }
});

const mapState = ({ user, selectedVideo }) => {
  return {
    user,
    selectedVideo,
  }
};

export default connect(mapState)(SavingVideo);
