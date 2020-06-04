const SET_ERROR = 'SET_ERROR';
const CLEAR_ERROR = 'CLEAR_ERROR'

export const setError = message => {
  return {
    type: SET_ERROR,
    error: {
      isError: true,
      message,
    }
  }
};

export const clearError = () => {
  return {
    type: CLEAR_ERROR,
    error: {
      isError: false,
      message: '',
    },
  }
};

export const errorReducer = (state = { isError: false, message: '' }, action) => {
  switch (action.type) {
    case SET_ERROR:
      return action.error;
    case CLEAR_ERROR:
      return action.error;
    default:
      return state;
  }
};