import axios from 'axios';

const SET_USER = 'SET_USER';
const CLEAR_USER = 'CLEAR_USER'

//action creators
export const setUser = user => {
  return {
    type: SET_USER,
    user
  }

};

const clearUser = () => {
  return {
    type: CLEAR_USER,
    user: {},
  }
}

//reducer
export const userReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_USER:
      return action.user;
    case CLEAR_USER:
      return action.user;
    default:
      return state;
  }
}

//thunks

export const createOrUpdateUser = body => {
  console.log('in createOrUpdateUser thunk')
  const { id, name, picture, expires, email } = body;
  return dispatch => {
    axios.post('https://duette.herokuapp.com/api/user',
      // axios.post('http://192.168.0.12:5000/api/user',
      {
        name,
        facebookId: id,
        expires,
        email,
        pictureUrl: picture.url,
        pictureWidth: picture.width,
        pictureHeight: picture.height,
        lastLogin: Date.now(),
      })
      .then(user => {
        // console.log('user: ', user.data)
        dispatch(setUser(user.data))
      })
      .catch(e => console.log('error in setUser thunk: ', e))
  }
}

export const fetchUser = facebookId => {
  console.log('in fetchUser thunk');
  return dispatch => {
    axios.get(`https://duette.herokuapp.com/api/user/facebookId/${facebookId}`)
      // axios.get(`http://192.168.0.12:5000/api/user/facebookId/${facebookId}`)
      .then(user => dispatch(setUser(user.data)))
      .catch(e => console.log('error in fetchUser thunk: ', e))
  }
}

export const clearCurrentUser = () => {
  return dispatch => {
    return dispatch(clearUser())
  }
}

