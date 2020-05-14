import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Text, View, SafeAreaView, FlatList, StyleSheet } from 'react-native';
import MyDuettesItem from './MyDuettesItem';

const MyDuettes = (props) => {
  const [selectedDuette, setSelectedDuette] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <SafeAreaView
      style={styles.container}>
      {
        props.userDuettes.length > 0 ? (
          <View>
            <Text style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              paddingVertical: 10,
              fontStyle: 'italic',
              // borderColor: 'black',
              // borderWidth: 1,
            }}>Showing all from the last month:</Text>
            <FlatList
              data={props.userDuettes.filter(duette => duette.videoId)}
              renderItem={({ item }) => (
                <MyDuettesItem
                  videoId={item.videoId}
                  duetteId={item.id}
                  videoTitle={item.videoTitle}
                  selectedDuette={selectedDuette}
                  setSelectedDuette={setSelectedDuette}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                />
              )}
              keyExtractor={item => item.id}
              viewabilityConfig={{}}
            />
          </View>
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
