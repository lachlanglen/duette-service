import React from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import Gallery from 'react-native-image-gallery';

const CatsGallery = (props) => {

  console.log('in CatsGallery')

  // FIXME: doesn't load on landscape view
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.titleTextBlue}>We're saving your video.</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 10,
    color: '#0047B9'
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
    marginVertical: 10,
    marginTop: 20,
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
