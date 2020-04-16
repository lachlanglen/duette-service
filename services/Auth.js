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
    console.log('in loginWithFacebook func')
    await Facebook.initializeAsync(config.facebook.appId);
    console.log('after facebook initializeAsync in Auth.js')
    const res = await Facebook.logInWithReadPermissionsAsync(
      config.facebook.appId,
      { permissions: ['public_profile'] },
    );

    console.log('facebook res: ', res)

    const { type, token } = res;

    console.log('line 19 auth.js')

    if (type === 'success' && token) {
      // Build Firebase credential with the Facebook access token.
      const credential = Firebase.auth.FacebookAuthProvider.credential(token);

      // Sign in with credential from the Facebook user.
      await Firebase
        .auth()
        .signInAndRetrieveDataWithCredential(credential);

      return res.token;
    }
  }

  /**
   * Register a subscription callback for changes of the currently authenticated user
   * 
   * callback Called with the current authenticated user as first argument
   */
  subscribeAuthChange(callback) {
    console.log('in subscribeAuthChange in AUth.js')
    Firebase.auth().onAuthStateChanged(callback);
  }

  logout() {
    return Firebase.auth().signOut();
  }
}