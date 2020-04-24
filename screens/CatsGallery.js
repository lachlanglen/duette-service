import React from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Gallery from 'react-native-image-gallery';

const CatsGallery = (props) => {

  console.log('in CatsGallery')

  /* pass in as props:

  croppingInProgress, croppingDone
  scalingInProgress, scalingDone
  savingInProgress, savingDone

  */

  // FIXME: doesn't load on landscape view
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.titleTextBlue}>We're saving your video.</Text>
      <View style={styles.progressBar}>
        <ActivityIndicator size="small" color="#0047B9" />
        <Text style={styles.progressText}>Cropping video</Text>
      </View>
      <View style={styles.progressBar}>
        <ActivityIndicator size="small" color="#0047B9" />
        <Text style={styles.progressText}>Scaling video</Text>
      </View>
      <View style={styles.progressBar}>
        <ActivityIndicator size="small" color="#0047B9" />
        <Text style={styles.progressText}>Saving video</Text>
      </View>
      <Text style={styles.bodyText}>This could take a few minutes, depending on the video length and your internet connection.</Text>
      <Text style={styles.titleTextSeaweed}>Have fun swiping through these cat pics while you're waiting! 😸</Text>
      <Gallery
        images={props.cats}
      />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextBlue: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  progressText: {
    paddingLeft: 20,
    fontSize: 18,
    fontWeight: 'bold'
  },
  titleTextSeaweed: {
    fontSize: 16,
    alignSelf: 'center',
    textAlign: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
    lineHeight: 22,
    color: '#187795'
  },
  bodyText: {
    fontSize: 16,
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 10,
    // marginTop: 20,
    lineHeight: 22,
    color: 'black'
  },
});

const mapState = ({ cats }) => {
  return {
    cats,
  }
}

export default connect(mapState)(CatsGallery)
