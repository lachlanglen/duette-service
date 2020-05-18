import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { handleLogin } from '../services/utils';
import buttonStyles from '../styles/button';
import { setDuettes } from '../redux/duettes';


const FacebookSignin = (props) => {

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Duette!</Text>
      <TouchableOpacity
        style={{
          ...buttonStyles.regularButton,
          width: '75%',
        }}
        onPress={handleLogin}
      >
        <Text style={buttonStyles.regularButtonText}>Login with Facebook</Text>
      </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0047B9',
  }
});

const mapState = ({ user }) => {
  return {
    user,
  }
}

const mapDispatch = dispatch => {
  return {
    setDuettes: (id) => dispatch(setDuettes(id)),
  }
}

export default connect(mapState, mapDispatch)(FacebookSignin);
