import * as React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import Constants from 'expo-constants';

import RecordVideoModal from './Modal';

export default function Home() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <View style={styles.container}>
      {
        !showModal ? (
          <Button
            onPress={() => setShowModal(true)}
            title="Show recording modal" />
        ) : (
            <RecordVideoModal
              showModal={showModal}
              setShowModal={setShowModal} />
          )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
});
