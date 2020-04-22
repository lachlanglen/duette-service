import React from 'react';
import { Provider, connect } from 'react-redux'
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import store from './redux/store';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ErrorBoundary from './ErrorBoundary';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';
import { setVideos, fetchVideos } from './redux/videos';
import { loadCats } from './redux/cats'

const Stack = createStackNavigator();

console.disableYellowBox = true;

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    console.log('in App.js useEffect')
    async function loadResourcesAndDataAsync() {
      console.log('in loadResourcesAndDataAsync')
      try {
        console.log('in try block')
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        });

        // const videos = await (axios.get('https://duette.herokuapp.com/api/video')).data;
        // console.log('videos in App.js: ', videos)
        console.log('before fetchVideos')
        store.dispatch(fetchVideos());
        store.dispatch(loadCats());
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
          <ErrorBoundary>
            <Provider store={store}>
              <Stack.Navigator>
                <Stack.Screen name="Root" component={BottomTabNavigator} />
              </Stack.Navigator>
            </Provider>
          </ErrorBoundary>
        </NavigationContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});