/* eslint-disable max-statements */
import React, { useState } from 'react';
// import { withRouter } from 'react-router-dom'
import { Image, Text, View, Modal, Button, StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImageManipulator from "expo-image-manipulator";
import t from 'tcomb-form-native';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import axios from 'axios';
import CatsGallery from './CatsGallery';
import { fetchVideos } from '../redux/videos';

const DetailsModal = (props) => {
  const { setRecord, setPreview, setShowDetailsModal, handleDetailsExit, dataUri } = props;

  const [formRef, setFormRef] = useState(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localUri, setLocalUri] = useState('');
  const [saving, setSaving] = useState(false);

  const VideoForm = t.struct({
    title: t.String,
    composer: t.String,
    key: t.String,
    performer: t.String
  });

  const Form = t.form.Form;

  const options = {
    fields: {
      title: {
        error: 'Please add song title',
      },
      composer: {
        error: 'Please add composer',
      },
      key: {
        error: `Please add key (e.g. 'C# minor')`,
      },
      performer: {
        error: 'Please add your name!',
      },
    },
  };

  const handlePost = async () => {
    const value = formRef.getValue(); // use that ref to get the form value
    console.log('value: ', value);
    if (value.title) console.log('title: ', value.title)
    const { title, composer, key, performer } = value;
    // send vid to ffmpeg for cropping & uploading to AWS
    // use returned key to create local DB record, storing file url as well
    try {
      let formData = new FormData();
      const UUID = uuid.v4();
      let uriParts = dataUri.split('.');
      let fileType = uriParts[uriParts.length - 1];
      formData.append('video', {
        uri: dataUri,
        name: UUID,
        type: `video/${fileType}`,
      });
      console.log('formData line 55: ', formData)
      const vidKey = (await axios.post('https://duette.herokuapp.com/api/ffmpeg/accompaniment', formData)).data
      // save AWS vid to local file
      const s3Url = `https://duette.s3.us-east-2.amazonaws.com/${vidKey}`;
      const file = await FileSystem.downloadAsync(
        s3Url,
        FileSystem.documentDirectory + `${vidKey}.mp4`
      )
      console.log('Finished downloading to ', file.uri);
      setLocalUri(file.uri);
      setSuccess(true);
      // create thumbnail
      const thumbnail = await VideoThumbnails.getThumbnailAsync(dataUri, { time: 3000 });
      const thumbnailUri = thumbnail.uri;
      const videoRecord = (await axios.post('https://duette.herokuapp.com/api/video', { title, composer, key, performer, thumbnailUri, videoUri: file.uri })).data
      console.log('videoRecord: ', videoRecord);
      props.fetchVideos();
      setSaving(false);
      setSuccess(true);
      // setShowDetailsModal(false);
    } catch (e) {
      console.log('error in handleSave: ', e)
    }
  }

  const handleSave = () => {
    setSaving(true);
    handlePost();
  }

  const handleRecordAnother = () => {
    setPreview(false);
  }

  const handleExit = () => {
    setRecord(false);
    setPreview(false);
  }

  // console.log('showDetailsModal: ', showDetailsModal)

  console.log('saving? ', saving)
  console.log('hi in details modal')

  return (
    saving ? (
      // <View style={{ flex: 1 }}>
      <CatsGallery />
      // </View>
    ) : (
        success ? (
          // TODO: pick up here with real success component
          <View>
            <Text style={styles.titleTextBlue}>Successfully saved!</Text>
            <Image style={styles.successCat} source={require('../assets/images/happy_grumpy_cat.png')} />
            <Button
              title="Exit"
              onPress={handleExit} />
            <Button
              title="Record another video"
              onPress={handleRecordAnother} />
          </View>
        ) : (
            <View style={styles.container}>
              <Modal
                onRequestClose={handleDetailsExit}
                supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
              >
                {
                  postSuccess ? (
                    <View style={{ paddingTop: 50 }}>
                      <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: '#0047B9' }}>Posted!</Text>
                      <Button
                        title="Record another accompaniment"
                        onPress={handleRecordAnother} />
                      <Button
                        onPress={handleDetailsExit}
                        title="Home" />
                    </View>
                  ) : (
                      <View style={{ paddingTop: 30, paddingHorizontal: 10 }}>
                        <Text style={{ fontSize: 20, color: 'blue', fontWeight: 'bold', textAlign: 'center', margin: 10 }}>Please enter the following details:</Text>
                        <Form
                          type={VideoForm}
                          ref={ref => setFormRef(ref)}
                          options={options}
                        />
                        <Button
                          title="Save Video!"
                          onPress={handleSave}
                        />
                        <Button
                          title="Back"
                          onPress={() => setShowDetailsModal(false)}
                        />
                      </View>
                    )
                }
              </Modal>
            </View >
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
    borderWidth: 2
  }
});

const mapDispatch = dispatch => {
  return {
    fetchVideos: () => dispatch(fetchVideos()),
  }
}

export default connect(null, mapDispatch)(DetailsModal);

// export default withRouter(DetailsModal);
