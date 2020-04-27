import * as Facebook from 'expo-facebook';

import { config } from '../config';
import { Firebase } from '../integrations/firebase';

export default class AuthService {
  /**
   * Login with Facebook and Firebase
   *
   * Uses Expo Facebook API and authenticates the Facebook user in Firebase
   */
  async loginWithFacebook() {
    await Facebook.initializeAsync(config.facebook.appId);
    const res = await Facebook.logInWithReadPermissionsAsync(
      config.facebook.appId,
      { permissions: ['public_profile', 'email'] },
    );

    console.log('facebook res: ', res)

    return res;
  }

  /**
   * Register a subscription callback for changes of the currently authenticated user
   * 
   * callback Called with the current authenticated user as first argument
   */
  subscribeAuthChange(callback) {
    console.log('in subscribeAuthChange in Auth.js')
    Firebase.auth().onAuthStateChanged(callback);
  }

  logout() {
    return Firebase.auth().signOut();
  }
}