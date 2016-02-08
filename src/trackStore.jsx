import { combineReducers } from 'redux'

const tracks = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TRACK':
      return [...state, action.track]
      break
    default:
      return state
  }
}

const app = combineReducers({
  tracks
})

export default app
