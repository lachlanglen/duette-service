import axios from 'axios';

const SET_SELECTED_VIDEO = 'SET_SELECTED_VIDEO';
const CLEAR_SELECTED_VIDEO = 'CLEAR_SELECTED_VIDEO'

//action creators
const setSelectedVideo = video => {
  return {
    type: SET_SELECTED_VIDEO,
    video
  }

};

const clearSelectedVideo = () => {
  return {
    type: CLEAR_SELECTED_VIDEO,
    video: {},
  }
}

//reducer
export const singleVideoReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SELECTED_VIDEO:
      return action.video;
    case CLEAR_SELECTED_VIDEO:
      return action.video;
    default:
      return state;
  }
}

//thunks
// export const fetchVideo = function (videoId) {
//   return dispatch => {
//     axios.get(`https://duette.herokuapp.com/api/show/${videoId}`)
//       .then(video => dispatch(setSelectedVideo(video.data)))
//       .catch(e => console.log(e));
//   }
// };

export const setVideo = id => {
  console.log('in setVideo thunk')
  return dispatch => {
    axios.get(`https://duette.herokuapp.com/api/video/${id}`)
      .then(video => {
        console.log('video: ', video.data)
        dispatch(setSelectedVideo(video.data))
      })
      .catch(e => console.log('error in setVideo thunk: ', e))
  }
}

export const clearVideo = () => {
  return dispatch => {
    return dispatch(clearSelectedVideo())
  }
}

