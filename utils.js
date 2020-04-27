import * as SecureStore from 'expo-secure-store';
import store from './redux/store';
import { clearCurrentUser, createOrUpdateUser } from './redux/user';
import { toggleUserInfo } from './redux/userInfo';
import AuthService from './services/Auth';

const Auth = new AuthService;

export const handleLogin = async () => {
  const permissionsObj = await Auth.loginWithFacebook();
  // console.log('permissionsObj: ', permissionsObj);
  if (permissionsObj.type === 'success') {
    const { declinedPermissions, expires, permissions, token } = permissionsObj;
    try {
      const basicInfo = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
      const { id, name } = await basicInfo.json();
      // console.log('id: ', id, 'name: ', name)
      const moreInfo = await fetch(`https://graph.facebook.com/10158413653431177?fields=email,picture&access_token=${token}`);
      const { email, picture } = await moreInfo.json();
      // create or update user & store this user on state
      store.dispatch(createOrUpdateUser({ id, name, picture, email, expires }));
      // save token and expiry to secure store
      try {
        await SecureStore.setItemAsync('accessToken', token);
        await SecureStore.setItemAsync('expires', expires.toString());
        await SecureStore.setItemAsync('facebookId', id);
      } catch (e) {
        console.log('error setting access token, expires or facebookId keys on secure store: ', e)
      }
    } catch (e) {
      console.log('error fetching user info: ', e)
    }
  } else {
    console.log('login cancelled')
  }
}

export const handleLogout = async (displayUserInfo) => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('expires');
    await SecureStore.deleteItemAsync('facebookId');
    console.log('deleted items from secure store');
    store.dispatch(clearCurrentUser());
    store.dispatch(toggleUserInfo(!displayUserInfo));
  } catch (e) {
    console.log('error deleting items from secure store: ', e)
  }
};
