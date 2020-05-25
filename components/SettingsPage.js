import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Text, View, SafeAreaView, FlatList, StyleSheet, Dimensions, TouchableOpacity, Platform, Alert } from 'react-native';
import { Input } from 'react-native-elements';
import * as ScreenOrientation from 'expo-screen-orientation';
import buttonStyles from '../styles/button';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { validate } from 'validate.js';

const SettingsPage = (props) => {
  const [screenOrientation, setScreenOrientation] = useState('');
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

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
  };

  const constraints = {
    emailAddress: {
      presence: {
        allowEmpty: false,
        message: "^Please enter an email address"
      },
      email: {
        message: "^Please enter a valid email address"
      }
    },
  };

  const handleEditEmail = () => {
    setEditEmail(true);
  };

  const handleSaveEmail = () => {
    console.log('in handleSaveEmail');
    // TODO: save email
    setEditEmail(false);
  };

  const handleValidateEmail = () => {
    setError(null);
    console.log('email: ', email)
    const validationResult = validate({ emailAddress: email }, constraints);
    console.log('validationResult: ', validationResult);
    if (!validationResult) {
      // there are no errors; continue to updating user's email
      Alert.alert(
        'Is this correct?',
        `Please confirm your email address: ${email}`,
        [
          { text: 'Yes, save it!', onPress: () => handleSaveEmail() },
          { text: 'Cancel', onPress: () => { } }
        ],
        { cancelable: false }
      );
    } else {
      // there are errors; set them on state and display in UI
      setError(validationResult.emailAddress[0]);
    }
  }

  return (
    showPrivacyPolicyModal ? (
      <PrivacyPolicyModal
        setShowPrivacyPolicyModal={setShowPrivacyPolicyModal}
      />
    ) : (
        <View style={styles.container}>
          <Text style={styles.titleTextBlue}>Your email:</Text>
          <View style={styles.lineContainer}>
            {
              !editEmail ? (
                <Text style={styles.emailText}>{props.user.email}</Text>
              ) : (
                  <Input
                    // labelStyle={styles.labelText}
                    containerStyle={styles.inputField}
                    onChangeText={val => setEmail(val)}
                    // value={title}
                    // label="Title"
                    placeholder="Enter your email here" />
                )
            }
            <TouchableOpacity
              onPress={!editEmail ? handleEditEmail : handleValidateEmail}>
              <Text style={styles.editText}>{!editEmail ? 'Edit' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          {
            error && (
              <Text style={styles.errorText}>{error}</Text>
            )
          }
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
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputField: {
    width: '80%',
    marginTop: 10
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
    marginTop: 10,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 16,
  },
  editText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#0047B9',
  }
});

const mapState = ({ user }) => {
  return {
    user,
  }
}

export default connect(mapState)(SettingsPage);
