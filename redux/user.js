import axios from 'axios';

const SET_USER = 'SET_USER';
const CLEAR_USER = 'CLEAR_USER'

//action creators
const setUser = user => {
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

export const fetchOrCreateUser = body => {
  console.log('in fetchOrCreateUser thunk')
  const { facebookToken, displayName, photoURL } = body;
  return dispatch => {
    axios.post('https://duette.herokuapp.com/api/user', { facebookToken, displayName, photoURL })
      .then(user => {
        // console.log('user: ', user.data)
        dispatch(setUser(user.data))
      })
      .catch(e => console.log('error in setUser thunk: ', e))
  }
}

export const clearCurrentUser = () => {
  return dispatch => {
    return dispatch(clearUser())
  }
}

