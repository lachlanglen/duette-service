import axios from 'axios';

const SET_VIDEOS = 'SET_VIDEOS';

export const setVideos = videos => {
  return {
    type: SET_VIDEOS,
    videos
  }

};

export const videosReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_VIDEOS:
      return action.videos;
    default:
      return state;
  }
}

export const fetchVideos = (text) => {
  return dispatch => {
    axios.get('https://duette.herokuapp.com/api/video')
      .then(vids => {
        if (text) {
          const filteredVids = vids.data.filter(vid => vid.title.includes(text) || vid.composer.includes(text) || vid.key.includes(text) || vid.performer.includes(text));
          dispatch(setVideos(filteredVids))
        }
        else {
          dispatch(setVideos(vids.data))
        }
      })
      .catch(e => console.log('error in setVideos thunk: ', e))
  };
};

export const postVideo = (details) => {
  return dispatch => {
    axios.post('https://duette.herokuapp.com/api/video', details)
      .then(() => dispatch(fetchVideos()))
      .catch(e => console.log('error in postVideo thunk: ', e))
  };
};

