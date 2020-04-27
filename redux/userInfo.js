import axios from 'axios';

const TOGGLE_INFO = 'TOGGLE_INFO';

//action creators
export const toggleUserInfo = bool => {
  return {
    type: TOGGLE_INFO,
    bool
  }

};

//reducer
export const displayUserInfoReducer = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_INFO:
      return action.bool;
    default:
      return state;
  }
}

