/* eslint-disable complexity */
import React from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { Icon } from 'react-native-elements';
import Gallery from 'react-native-image-gallery';

const CatsGallery = (props) => {

  const {
    infoGettingDone,
    croppingDone,
    savingDone,
  } = props;

  // FIXME: doesn't load on landscape view
  return (
    <View style={{ flex: 1, paddingTop: props.addPadding ? props.addPadding : 0 }}>
      <Text style={styles.titleTextBlue}>We're saving your video.</Text>
      <Text style={{ ...styles.titleTextBlue, fontSize: 16, marginBottom: 20, color: '#187795' }}>Please don't leave this screen!</Text>
      <View style={styles.progressBar}>
        {
          infoGettingDone ? (
            <Icon
              name="done"
              type="material"
              color="green"
              size={28} />
          ) : (
              <ActivityIndicator size="small" color="#0047B9" />
            )
        }
        <Text style={{ ...styles.progressText, color: infoGettingDone ? 'green' : 'darkgrey' }}>Getting video info</Text>
      </View>
      <View style={styles.progressBar}>
        {
          croppingDone ? (
            <Icon
              name="done"
              type="material"
              color="green"
              size={28} />
          ) : (
              <ActivityIndicator size="small" color="#0047B9" />
            )
        }
        <Text style={{ ...styles.progressText, color: croppingDone ? 'green' : 'darkgrey' }}>Scaling/Cropping</Text>
      </View>
      <View style={styles.progressBar}>
        {
          savingDone ? (
            <Icon
              name="done"
              type="material"
              color="green"
              size={28} />
          ) : (
              <ActivityIndicator size="small" color="#0047B9" />
            )
        }
        <Text style={{ ...styles.progressText, color: savingDone ? 'green' : 'darkgrey' }}>Saving video</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15
  },
  progressText: {
    paddingLeft: 20,
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center'
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