import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Text, View, SafeAreaView, FlatList, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import buttonStyles from '../styles/button';
import PrivacyPolicyModal from './PrivacyPolicyModal';

const SupportPage = (props) => {
  const [screenOrientation, setScreenOrientation] = useState('');
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);

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

  const handleViewPrivacyPolicy = () => {
    setShowPrivacyPolicyModal(true);
  }

  return (
    showPrivacyPolicyModal ? (
      <PrivacyPolicyModal
        setShowPrivacyPolicyModal={setShowPrivacyPolicyModal}
      />
    ) : (
        <View style={styles.container}>
          <Text style={styles.titleTextBlue}>Contact Us:</Text>
          <Text style={styles.emailText}>support@duette.app</Text>
          <TouchableOpacity
            onPress={handleViewPrivacyPolicy}
            style={{
              ...buttonStyles.regularButton,
              width: '75%',
              margin: 20,
            }}>
            <Text style={buttonStyles.regularButtonText}>View Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      )
  )
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#ffd12b',
    flex: 1,
  },
  titleTextBlue: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  emailText: {
    fontSize: 18,
    margin: 10,
    fontWeight: 'bold',
  }
});

export default SupportPage;
