import React from 'react';
import { Image, StyleSheet, Text, View, Button } from 'react-native';
import { connect } from 'react-redux';

import { createOrUpdateUser } from '../redux/user';
import { handleLogin } from '../utils';

const FacebookSignin = (props) => {

  return (
    <View style={styles.container}>
      <Text>Welcome!</Text>
      <Button onPress={handleLogin} title='Login with Facebook' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapState = ({ user }) => {
  return {
    user,
  }
}

const mapDispatch = dispatch => {
  return {
    createOrUpdateUser: info => dispatch(createOrUpdateUser(info))
  }
}

export default connect(mapState, mapDispatch)(FacebookSignin);
