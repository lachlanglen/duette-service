/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Image, Text, View, Modal, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import { postVideo } from '../redux/videos';
import Form from './Form';
import ErrorView from './Error';
import buttonStyles from '../styles/button';
import SavingVideo from './SavingVideo';

const DetailsModal = (props) => {
  const {
    setRecord,
    setPreview,
    setShowDetailsModal,
    handleDetailsExit,
    dataUri
  } = props;

  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [songKey, setSongKey] = useState('');
  const [performer, setPerformer] = useState(props.user.name);

  const handleSave = () => {
    setSaving(true);
  };

  const handleRecordAnother = () => {
    setPreview(false);
  };

  const handleExit = () => {
    setRecord(false);
    setPreview(false);
  };

  const handleError = () => {
    setSaving(false);
    setError(false);
  };

  return (
    error ? (
      <ErrorView handleGoBack={handleError} />
    ) : (
        saving ? (
          <SavingVideo
            dataUri={dataUri}
            setSuccess={setSuccess}
            setSaving={setSaving}
            title={title}
            composer={composer}
            songKey={songKey}
            performer={performer}
            handleExit={handleExit}
            type="base track"
          />
        ) : (
            success ? (
              <View>
                <Text style={styles.titleTextBlue}>Base track successfully uploaded!</Text>
                <Text style={{
                  ...styles.titleTextBlue,
                  fontSize: 18,
                  marginTop: 0,
                  fontWeight: 'normal'
                }}>We'll let you know when it's finished processing.</Text>
                <Image style={styles.successCat} source={require('../assets/images/happy_grumpy_cat.png')} />
                <TouchableOpacity
                  onPress={handleExit}
                  style={{
                    ...buttonStyles.regularButton,
                    width: '30%',
                    marginTop: 5,
                    marginBottom: 15
                  }}>
                  <Text style={buttonStyles.regularButtonText}>Exit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRecordAnother}
                  style={{
                    ...buttonStyles.regularButton,
                    width: '80%'
                  }}>
                  <Text style={buttonStyles.regularButtonText}>Record another base track</Text>
                </TouchableOpacity>
              </View>
            ) : (
                <View style={styles.container}>
                  <Modal
                    onRequestClose={handleDetailsExit}
                    supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                  >
                    <Form
                      handleSave={handleSave}
                      title={title}
                      setTitle={setTitle}
                      composer={composer}
                      setComposer={setComposer}
                      songKey={songKey}
                      setSongKey={setSongKey}
                      performer={performer}
                      setPerformer={setPerformer}
                      setShowDetailsModal={setShowDetailsModal}
                      type="initial" />
                  </Modal>
                </View >
              )
          )
      )
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
    borderWidth: 2,
    borderRadius: 5,
  }
});

const mapState = ({ user }) => {
  return {
    user,
  }
}

const mapDispatch = dispatch => {
  return {
    postVideo: details => dispatch(postVideo(details)),
  }
}

export default connect(mapState, mapDispatch)(DetailsModal);
