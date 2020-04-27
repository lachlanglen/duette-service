/* eslint-disable radix */
import React from 'react';
import { Provider, connect } from 'react-redux'
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import store from './redux/store';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ErrorBoundary from './ErrorBoundary';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';
import { setVideos, fetchVideos } from './redux/videos';
import { loadCats } from './redux/cats';
import { fetchUser } from './redux/user';

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
        // check for accessToken and expiry on secure store
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
          // check for expires
          const expires = await SecureStore.getItemAsync('expires');
          console.log('expires: ', expires);
          console.log('Date.now(): ', Date.now().toString().slice(0, 10));
          // if token is still valid
          if (parseInt(expires) > parseInt(Date.now().toString().slice(0, 10))) {
            console.log('user is current!')
            // fetch and set user with facebookId
            const facebookId = await SecureStore.getItemAsync('facebookId');
            console.log('facebookId: ', facebookId)
            store.dispatch(fetchUser(facebookId));
          } else {
            console.log('token is no longer valid')
            console.log('parseInt(expires) - Date.now(): ', parseInt(expires) - Date.now())
          }
          // if token has expired, user will be prompted to login which will refresh their token
        }
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