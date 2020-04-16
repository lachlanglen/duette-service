import React from 'react';
import { Image, StyleSheet, Text, View, Button } from 'react-native';
import { connect } from 'react-redux';

import AuthService from '../services/Auth';
import { fetchOrCreateUser } from '../redux/user';

const Auth = new AuthService;

class FacebookSignin extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
    }
  }

  componentDidMount() {
    Auth.subscribeAuthChange(user => {
      // console.log('user: ', user)
      this.setState({ user }); // this could be either NULL or a firebase user object
      // call thunk with user obj
      // set user on Redux with token
      // this.props.setUser(user)
    });
    console.log('Auth.subscribeAuthChange: ', Auth.subscribeAuthChange)
  }

  handleLogin = async () => {
    const token = await Auth.loginWithFacebook();
    console.log('token: ', token);
    console.log('state.user in handleLogin: ', this.state.user)
    const { displayName, photoURL } = this.state.user;
    // send this token to server to create or retrieve user and store on state
    this.props.fetchOrCreateUser({ facebookToken: token, displayName, photoURL });
  }

  render() {
    const { user } = this.state;

    // console.log('state.user in render: ', user)

    console.log('this.props.user in render: ', this.props.user)

    if (user) {
      const avatar = user.photoURL && (
        <Image style={{ width: 50, height: 50 }} source={{ uri: user.photoURL }} />
      );

      return (
        <View style={styles.container}>
          <Text>You are logged in!</Text>
          {avatar}
          <Button onPress={Auth.logout} title='Logout' />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text>Welcome!</Text>
        <Button onPress={this.handleLogin} title='Login with Facebook' />
      </View>
    );
  }
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
    fetchOrCreateUser: body => dispatch(fetchOrCreateUser(body)),
  }
}

export default connect(mapState, mapDispatch)(FacebookSignin)