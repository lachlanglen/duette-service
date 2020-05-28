import { combineReducers } from 'redux'
import { singleVideoReducer } from './singleVideo'
import { catsReducer } from './cats';
import { videosReducer } from './videos';
import { userReducer } from './user';
import { displayUserInfoReducer } from './userInfo';
import { userDuettesReducer } from './duettes';
import { dataLoadedReducer } from './dataLoaded';
import { requestReviewReducer } from './requestReview';

const appReducer = combineReducers({
  videos: videosReducer,
  selectedVideo: singleVideoReducer,
  cats: catsReducer,
  user: userReducer,
  displayUserInfo: displayUserInfoReducer,
  userDuettes: userDuettesReducer,
  dataLoaded: dataLoadedReducer,
  requestReview: requestReviewReducer,
})

export default appReducer;
