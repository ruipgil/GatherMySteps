import { combineReducers } from 'redux'

const tracks = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TRACK':
      return [...state, action.track]
    case 'TOGGLE_TRACK_DISPLAY':
      let nextState = [...state]
      nextState[action.index].display = !nextState[action.index].display
      return nextState
    default:
      return state
  }
}

const app = combineReducers({
  tracks
})

export default app
