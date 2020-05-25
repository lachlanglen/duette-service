import React, { createRef, useState } from 'react';
import { connect } from 'react-redux';
import { Image, Text, View, Modal, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Input } from 'react-native-elements';
import { clearVideo } from '../redux/singleVideo';

const Form = (props) => {

  const {
    title,
    setTitle,
    composer,
    setComposer,
    songKey,
    setSongKey,
    performer,
    setPerformer,
    setShowDetailsModal,
    setShowEditDetailsModal,
    handleSave,
    handleUpdate,
    type
  } = props;

  const handleExitEdit = () => {
    props.clearVideo();
    setShowEditDetailsModal(false);
  };

  const handleBack = () => {
    if (type === 'initial') {
      setShowDetailsModal(false);
    } else {
      handleConfirmExitEdit();
    }
  };

  const handleConfirmExitEdit = () => {
    Alert.alert(
      'Are you sure?',
      "If you go back now your changes won't be saved.",
      [
        { text: 'Yes, go back', onPress: () => handleExitEdit() },
        { text: 'Keep editing', onPress: () => { } }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{type === 'initial' ? 'Please enter the following details:' : 'Update details:'}</Text>
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => setTitle(val)}
        value={title}
        label="Title (required)"
        placeholder="e.g. Barcarolle" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => setComposer(val)}
        value={composer}
        label="Composer (optional, but recommended)"
        placeholder="e.g. Offenbach" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => setSongKey(val)}
        value={songKey}
        label="Key (optional, but recommended)"
        placeholder="e.g. B-flat major" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => setPerformer(val)}
        value={performer}
        label="Performer (required)"
        placeholder="Enter your name here!" />
      <TouchableOpacity
        onPress={type === 'initial' ? handleSave : handleUpdate}
        disabled={!title || !performer}
        style={{ ...styles.button, backgroundColor: !title || !performer ? 'grey' : '#0047B9' }}>
        <Text style={styles.buttonText}>{type === 'initial' ? 'Submit!' : 'Update!'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.button}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0047B9',
    marginBottom: 20
  },
  labelText: {
    color: '#187795',
  },
  inputField: {
    marginBottom: 20
  },
  button: {
    backgroundColor: '#0047B9',
    width: '25%',
    height: 40,
    alignSelf: 'center',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white'
  }
})

const mapState = ({ user, selectedVideo }) => {
  return {
    user,
    selectedVideo,
  }
};

const mapDispatch = dispatch => {
  return {
    clearVideo: () => dispatch(clearVideo()),
  }
}

export default connect(mapState, mapDispatch)(Form);
