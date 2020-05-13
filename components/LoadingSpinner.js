import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingSpinner = () => {
  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator
        style={styles.spinner}
        size="large"
        color="#0047B9" />
    </View>
  )
};

const styles = StyleSheet.create({
  spinnerContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 30,
  },
})

export default LoadingSpinner;
