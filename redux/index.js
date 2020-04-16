import { combineReducers } from 'redux'
import { singleVideoReducer } from './singleVideo'
import { catsReducer } from './cats';
import { videosReducer } from './videos';
import { userReducer } from './user';

const appReducer = combineReducers({
  videos: videosReducer,
  selectedVideo: singleVideoReducer,
  cats: catsReducer,
  user: userReducer,
})

export default appReducer;