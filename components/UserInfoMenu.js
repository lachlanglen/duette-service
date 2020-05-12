import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux'
import { handleLogout } from '../services/utils';
import { toggleUserInfo } from '../redux/userInfo';

const UserInfoMenu = (props) => {

  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('My Duettes');
    props.toggleUserInfo(!props.displayUserInfo);
  }

  return (
    <View>
      <Text style={{
        // backgroundColor: 'pink',
        alignSelf: 'flex-end',
        padding: 5,
      }}>Logged in as {props.user.name}
      </Text>
      <TouchableOpacity
        onPress={handlePress}
      >
        <Text
          style={styles.logoutText}>My Duettes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleLogout(props.displayUserInfo)}>
        <Text
          style={styles.logoutText}>Logout
        </Text>
      </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
  logoutText: {
    height: 30,
    width: 100,
    alignSelf: 'flex-end',
    textAlign: 'center',
    paddingTop: 5,
    backgroundColor: 'lightgrey',
    borderWidth: 1,
    borderColor: '#0047B9',
    fontWeight: 'bold',
  }
})

const mapState = ({ user, displayUserInfo }) => {
  return {
    user,
    displayUserInfo
  }
};

const mapDispatch = dispatch => {
  return {
    toggleUserInfo: bool => dispatch(toggleUserInfo(bool)),
  }
};

export default connect(mapState, mapDispatch)(UserInfoMenu);
