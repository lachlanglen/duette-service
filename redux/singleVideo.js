import axios from 'axios';
import { fetchVideos } from './videos';

const SET_SELECTED_VIDEO = 'SET_SELECTED_VIDEO';
const CLEAR_SELECTED_VIDEO = 'CLEAR_SELECTED_VIDEO'

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

export const setVideo = id => {
  return dispatch => {
    axios.get(`https://duette.herokuapp.com/api/video/${id}`)
      .then(video => dispatch(setSelectedVideo(video.data)))
      .catch(e => {
        throw new Error('error in setVideo thunk: ', e)
      })
  }
};

export const clearVideo = () => {
  return dispatch => {
    return dispatch(clearSelectedVideo())
  }
};

export const updateVideo = (id, updatedDetails, searchText) => {
  return dispatch => {
    axios.put(`https://duette.herokuapp.com/api/video/${id}`, updatedDetails)
      .then(() => dispatch(fetchVideos(searchText)))
      .catch(e => {
        throw new Error('error in updateVideo thunk: ', e)
      })
  }
}

