import React from 'react';
import { View, Text, Dimensions, Image, Button } from 'react-native';

const Error = (props) => {
  const { handleGoBack } = props;

  let screenWidth = Math.round(Dimensions.get('window').width);
  let screenHeight = Math.round(Dimensions.get('window').height);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 15 }}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#0047B9', paddingBottom: 10 }}>Oops!</Text>
      <Text style={{ fontSize: 20, fontWeight: 'normal', color: '#0047B9', paddingBottom: 10 }}>Something went wrong 😿</Text>
      <Button
        onPress={handleGoBack}
        title="Go back"
      />
      <Image
        style={{
          width: screenWidth < screenHeight ? screenWidth : 400,
          height: 300,
          marginTop: 10
        }}
        source={require('../assets/images/error-cat.jpg')}
      />
    </View>
  )
}

export default Error;
