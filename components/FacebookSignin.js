import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { connect } from 'react-redux';

import { createOrUpdateUser } from '../redux/user';
import { handleLogin } from '../services/utils';

const FacebookSignin = () => {

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Duette!</Text>
      <Button onPress={handleLogin} title="Login with Facebook" />
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
  text: {
    marginBottom: 20,
  }
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
