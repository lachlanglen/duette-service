import { combineReducers } from 'redux'
import { singleVideoReducer } from './singleVideo'
import { catsReducer } from './cats';
import { videosReducer } from './videos';
import { userReducer } from './user';
import { displayUserInfoReducer } from './userInfo';

const appReducer = combineReducers({
  videos: videosReducer,
  selectedVideo: singleVideoReducer,
  cats: catsReducer,
  user: userReducer,
  displayUserInfo: displayUserInfoReducer,
})

export default appReducer;