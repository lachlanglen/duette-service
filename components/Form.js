import React, { createRef, useState } from 'react';
import { connect } from 'react-redux';
import { Image, Text, View, Modal, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Input } from 'react-native-elements';

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
    handleSave
  } = props;

  // console.log('title: ', title, 'composer: ', composer, 'key: ', songKey, 'performer: ', performer)

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Please enter the following details:</Text>
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => setTitle(val)}
        value={title}
        label="Title"
        placeholder="e.g. Barcarolle" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => setComposer(val)}
        value={composer}
        label="Composer"
        placeholder="e.g. Offenbach" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => setSongKey(val)}
        value={songKey}
        label="Key"
        placeholder="e.g. B-flat major" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => setPerformer(val)}
        value={performer}
        label="Performer"
        placeholder="Enter your name here!" />
      <TouchableOpacity
        onPress={handleSave}
        disabled={!title || !composer || !songKey || !performer}
        style={{ ...styles.button, backgroundColor: !title || !composer || !songKey || !performer ? 'grey' : '#0047B9' }}>
        <Text style={styles.buttonText}>Submit!</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setShowDetailsModal(false)}
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

const mapState = ({ user }) => {
  return {
    user
  }
}

export default connect(mapState)(Form);
