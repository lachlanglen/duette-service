import axios from 'axios';

const SET_CATS = 'SET_CATS';

//action creators
const setCats = cats => {
  return {
    type: SET_CATS,
    cats
  }

};

//reducer
export const catsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_CATS:
      return action.cats;
    default:
      return state;
  }
}

//thunks

export const loadCats = () => {
  console.log('in setVideo thunk')
  return dispatch => {
    axios.get('https://api.thecatapi.com/v1/images/search', { headers: { 'x-api-key': '80e64f48-d071-46c7-8fea-96cdf578c1de' }, params: { limit: 100, size: 'full' } })
      .then(cats => {
        return cats.data.map(cat => (
          {
            source: {
              uri: cat.url
            }
          }
        ))
      })
      .then(data => dispatch(setCats(data)))
      .catch(e => console.log('error in cats thunk: ', e))
  }
}

