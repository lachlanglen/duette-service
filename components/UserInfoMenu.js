import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux'
import { handleLogout } from '../services/utils';
import { toggleUserInfo } from '../redux/userInfo';
import buttonStyles from '../styles/button';

const UserInfoMenu = (props) => {

  const navigation = useNavigation();

  const handlePress = (type) => {
    navigation.navigate(type === 'duettes' ? 'My Duettes' : 'Settings');
    props.toggleUserInfo(!props.displayUserInfo);
  }

  return (
    <View style={{
      position: 'absolute',
      alignSelf: 'flex-end',
    }}>
      <View style={{
        ...styles.optionContainer,
        backgroundColor: 'white',
        borderTopWidth: 4,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      }}>
        <Text style={{
          ...styles.optionText,
          color: '#0047B9',
        }}>Logged in as {props.user.name}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          ...styles.optionContainer,
          borderRadius: 0,
        }}
        onPress={() => handlePress('duettes')}
      >
        <Text
          style={styles.optionText}>My Duettes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          ...styles.optionContainer,
          borderRadius: 0,
        }}
        onPress={() => handlePress('Settings')}
      >
        <Text
          style={styles.optionText}>Settings
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          ...styles.optionContainer,
          borderBottomWidth: 4,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        onPress={() => handleLogout(props.displayUserInfo)}>
        <Text
          style={{
            ...styles.optionText,
          }}>Logout
        </Text>
      </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
  optionContainer: {
    ...buttonStyles.regularButton,
    marginBottom: 0,
    paddingHorizontal: 0,
    alignSelf: 'flex-end',
    // borderRadius: 0,
    width: '100%',
    backgroundColor: '#ffd12b',
    borderTopWidth: 2,
    borderBottomWidth: 0,
    borderLeftWidth: 4,
  },
  optionText: {
    ...buttonStyles.regularButtonText,
    color: '#0047b9'
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
