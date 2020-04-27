import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'
import { handleLogout } from '../utils';

const UserInfoMenu = (props) => {

  return (
    <TouchableOpacity
      // TODO: fix styling
      onPress={() => handleLogout(props.displayUserInfo)}>
      <Text style={{
        // backgroundColor: 'pink',
        alignSelf: 'flex-end',
        padding: 5,
      }}>Logged in as {props.user.name}</Text>
      <Text
        style={{
          height: 30,
          width: 100,
          alignSelf: 'flex-end',
          textAlign: 'center',
          // paddingRight: 5,
          paddingTop: 5,
          backgroundColor: 'lightgrey',
          borderWidth: 1,
          borderColor: '#0047B9',
          fontWeight: 'bold'
        }}>Logout
      </Text>
    </TouchableOpacity>
  )
}

const mapState = ({ user, displayUserInfo }) => {
  return {
    user,
    displayUserInfo
  }
};

export default connect(mapState)(UserInfoMenu);
