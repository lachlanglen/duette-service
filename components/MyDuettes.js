import React from 'react';
import { connect } from 'react-redux';
import { Text, View, SafeAreaView, FlatList, StyleSheet } from 'react-native';
import MyDuettesItem from './MyDuettesItem';

const MyDuettes = (props) => {
  return (
    <SafeAreaView
      style={styles.container}>
      {
        props.userDuettes.length > 0 ? (
          <FlatList
            data={props.userDuettes}
            renderItem={({ item }) => (
              <MyDuettesItem
                videoId={item.videoId}
                duetteId={item.id}
              />
            )}
            keyExtractor={item => item.id}
            viewabilityConfig={{}}
          />
        ) : (
            <View>
              <Text style={styles.text}>
                No videos to display
              </Text>
            </View>
          )
      }
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD12B',
  },
  text: {
    marginTop: 10,
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

const mapState = ({ userDuettes }) => {
  return {
    userDuettes,
  }
}

export default connect(mapState)(MyDuettes);
