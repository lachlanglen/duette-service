import axios from 'axios';

const SET_VIDEOS = 'SET_VIDEOS';

//action creators
export const setVideos = videos => {
  return {
    type: SET_VIDEOS,
    videos
  }

};

//reducer
export const videosReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_VIDEOS:
      return action.videos;
    default:
      return state;
  }
}

//thunks

export const fetchVideos = (text) => {
  return dispatch => {
    axios.get('https://duette.herokuapp.com/api/video')
      .then(vids => {
        console.log('vids: ', vids.data)
        if (text) {
          const filteredVids = vids.data.filter(vid => vid.title.includes(text) || vid.composer.includes(text) || vid.key.includes(text) || vid.performer.includes(text));
          dispatch(setVideos(filteredVids))
        }
        else {
          dispatch(setVideos(vids.data))
        }
      })
      .catch(e => console.log('error in setVideos thunk: ', e))
  }
}

