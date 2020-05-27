/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Image, Text, View, Modal, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import uuid from 'react-native-uuid';
import axios from 'axios';
import CatsGallery from './CatsGallery';
import { postVideo } from '../redux/videos';
import Form from './Form';
import buttonStyles from '../styles/button';
import { updateVideo, clearVideo } from '../redux/singleVideo';

const EditDetailsModal = (props) => {

  const {
    id,
    setShowEditDetailsModal,
    origTitle,
    origComposer,
    origSongKey,
    origPerformer,
    origNotes,
  } = props;

  const [title, setTitle] = useState(origTitle);
  const [composer, setComposer] = useState(origComposer);
  const [songKey, setSongKey] = useState(origSongKey);
  const [performer, setPerformer] = useState(origPerformer);
  const [notes, setNotes] = useState(origNotes);

  const handleDone = () => {
    props.clearVideo();
    setShowEditDetailsModal(false);
  }

  const handleUpdate = () => {
    props.updateVideoDetails(id, { title, composer, key: songKey, performer });
    // FIXME: below will fire even updates have not successfully saved
    Alert.alert(
      'Updated!',
      "Your updates have been successfully saved.",
      [
        { text: 'OK', onPress: () => handleDone() },
      ],
      { cancelable: false }
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
      >
        <Form
          handleUpdate={handleUpdate}
          title={title}
          setTitle={setTitle}
          composer={composer}
          setComposer={setComposer}
          songKey={songKey}
          setSongKey={setSongKey}
          performer={performer}
          setPerformer={setPerformer}
          notes={notes}
          setNotes={setNotes}
          setShowEditDetailsModal={setShowEditDetailsModal}
          type="update" />
      </Modal>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titleTextBlue: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  successCat: {
    margin: 10,
    width: 300,
    height: 285,
    alignSelf: 'center',
    borderColor: 'black',
    borderWidth: 2
  }
});

const mapState = ({ user, selectedVideo }) => {
  return {
    user,
    selectedVideo,
  }
}

const mapDispatch = dispatch => {
  return {
    postVideo: details => dispatch(postVideo(details)),
    updateVideoDetails: (id, newDetails) => dispatch(updateVideo(id, newDetails)),
    clearVideo: () => dispatch(clearVideo()),
  }
}

export default connect(mapState, mapDispatch)(EditDetailsModal);
