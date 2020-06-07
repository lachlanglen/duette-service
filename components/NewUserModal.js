import React from 'react';
import { connect } from 'react-redux';
import { View, ScrollView, Text, Modal, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import buttonStyles from '../styles/button';
import { handleLogin } from '../services/utils';
// import { Overlay } from 'react-native-elements'

const NewUserModal = (props) => {

  console.log('props.user in NewUserModal: ', props.user)

  const handlePurchase = () => {
    Alert.alert(
      `Purchase`,
      "Here is where you will purchase.",
      [
        { text: 'OK', onPress: () => { } },
      ],
      { cancelable: false }
    )
  };

  return (
    <Modal>
      <ScrollView
        contentContainerStyle={styles.container}>
        <Image
          source={require('../assets/images/duette-logo-HD.png')}
          style={styles.logo} />
        <Text style={styles.titleText}>Welcome to Duette!</Text>
        <Text style={styles.subTitleText}>Start your <Text style={{ fontWeight: 'bold' }}>1-week free trial</Text> and make amazing split-screen music videos in seconds!</Text>
        <Text style={{
          ...styles.subTitleText,
          marginTop: 15,
        }}>After your free trial ends, you will be charged $1.99/month.</Text>
        <Text style={{
          ...styles.subTitleText,
          marginTop: 15,
          fontWeight: 'bold',
        }}>You can cancel anytime!</Text>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            ...buttonStyles.regularButton,
            marginTop: 30,
            width: '100%',
            height: 60,
            marginBottom: 0,
          }}>
          <Text style={{
            ...buttonStyles.regularButtonText,
            fontSize: 28,
          }}>Sign up with Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            marginTop: 10,
          }}>
          <Text style={{
            fontSize: 16,
            color: '#0047B9',
          }}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#ffd12b'
  },
  titleText: {
    color: '#0047B9',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
  },
  subTitleText: {
    color: 'black',
    fontSize: 22,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },
  logo: {
    width: 250,
    height: 100,
    // marginTop: 50,
    // marginBottom: 30,
  }
});

const mapState = ({ user }) => {
  return {
    user,
  }
};

export default connect(mapState)(NewUserModal);
