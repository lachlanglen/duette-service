/* eslint-disable radix */
import React from 'react';
import { Provider } from 'react-redux'
import { Text, TextInput, Platform, StatusBar, StyleSheet, View } from 'react-native';
import store from './redux/store';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Sentry from 'sentry-expo';
import axios from 'axios';
import Constants from 'expo-constants';
import ErrorBoundary from './ErrorBoundary';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';
import { fetchVideos } from './redux/videos';
import { loadCats } from './redux/cats';
import { fetchUser } from './redux/user';
import { fetchDuettes } from './redux/duettes';
import MyDuettes from './components/MyDuettes';
import DuetteScreen from './screens/DuetteScreen';
import SupportPage from './components/SupportPage';

Sentry.init({
  enableInExpoDevelopment: true,
  dsn: 'https://4f1d90283940486d93204bc6690934e2@o378963.ingest.sentry.io/5203127',
});

Sentry.setRelease(Constants.manifest.revisionId);

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

const Stack = createStackNavigator();

console.disableYellowBox = true;

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          'Gill Sans': require('./assets/fonts/gillsans.ttf'),
        });
        // check for accessToken and expiry on secure store
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
          // check for expires
          const expires = await SecureStore.getItemAsync('expires');
          // if token is still valid
          if (parseInt(expires) > parseInt(Date.now().toString().slice(0, 10))) {
            // user is current
            // fetch and set user with facebookId
            const facebookId = await SecureStore.getItemAsync('facebookId');
            store.dispatch(fetchUser(facebookId));
            const { id } = (await axios.get(`https://duette.herokuapp.com/api/user/facebookId/${facebookId}`)).data;
            store.dispatch(fetchDuettes(id));
          }
        }
        // store.dispatch(fetchVideos());
        store.dispatch(loadCats('final'));
      } catch (e) {
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
                <Stack.Screen name="My Duettes" component={MyDuettes} />
                <Stack.Screen name="Support" component={SupportPage} />
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