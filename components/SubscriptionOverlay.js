import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements';
import * as Device from 'expo-device';
import buttonStyles from '../styles/button';
import { toggleUpgradeOverlay } from '../redux/upgradeOverlay';

const SubscriptionOverlay = (props) => {

  const {
    screenOrientation,
  } = props;

  const [deviceType, setDeviceType] = useState(null);

  let screenWidth = Math.round(Dimensions.get('window').width);
  let screenHeight = Math.round(Dimensions.get('window').height);

  useEffect(() => {
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    getDeviceType();
  }, [])

  return (
    !screenOrientation ? (
      <View />
    ) : (
        <Overlay
          isVisible={props.displayUpgradeOverlay}
          overlayStyle={deviceType === 2 ? {
            backgroundColor: '#ffd12b',
            borderColor: '#187795',
            borderWidth: 2.5,
            borderRadius: 8,
            width: screenOrientation === 'PORTRAIT' ? screenWidth * 0.65 : screenWidth * 0.5,
            height: screenOrientation === 'PORTRAIT' ? screenHeight * 0.4 : screenHeight * 0.6,
          } : {
              backgroundColor: '#ffd12b',
              borderColor: '#187795',
              borderWidth: 2.5,
              borderRadius: 8,
              width: screenOrientation === 'PORTRAIT' ? screenWidth * 0.9 : screenWidth * 0.7,
              height: screenOrientation === 'PORTRAIT' ? screenHeight * 0.65 : screenHeight * 0.9,
            }}
        >
          <View style={{
            ...styles.container,
          }}>
            <Text style={styles.titleText}>Wanna Upgrade?</Text>
            <Text style={styles.subTitleText}>Here's what you get with Duette Pro:</Text>
            <Text style={styles.bulletPointTitle}>Go longer</Text>
            <Text style={styles.bulletPointText}>Record videos up to 9 mins long</Text>
            <Text style={styles.bulletPointTitle}>Go logo-less</Text>
            <Text style={styles.bulletPointText}>Remove the Duette logo from all your videos</Text>
            <TouchableOpacity
              style={{
                ...buttonStyles.regularButton,
                width: screenOrientation === 'PORTRAIT' ? '100%' : '80%',
                height: 60,
                marginTop: 14,
                marginBottom: 14,
              }}>
              <Text
                style={buttonStyles.regularButtonText}>
                Upgrade for $1.99/month
          </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => props.toggleUpgradeOverlay(false)}
              style={styles.notNowContainer}>
              <Text style={styles.notNowText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </Overlay>
      )
  )
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  titleText: {
    color: '#0047B9',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  subTitleText: {
    fontSize: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 14,
  },
  bulletPointTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  },
  bulletPointText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 14,
    // fontWeight: 'bold',
  },
  notNowContainer: {
    marginTop: 0,
  },
  notNowText: {
    fontSize: 18,
    color: '#0047B9',
  }
});

const mapState = ({ displayUpgradeOverlay }) => {
  return {
    displayUpgradeOverlay,
  }
};

const mapDispatch = dispatch => {
  return {
    toggleUpgradeOverlay: bool => dispatch(toggleUpgradeOverlay(bool)),
  }
}

export default connect(mapState, mapDispatch)(SubscriptionOverlay);
