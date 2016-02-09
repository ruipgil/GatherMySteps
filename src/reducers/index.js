import { combineReducers } from 'redux'

const tracks = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TRACK':
      return [...state, action.track]
    case 'TOGGLE_TRACK_DISPLAY':
      let nextState = [...state]
      let track = nextState.find((x) => x.id === action.trackId)
      track.display = !track.display
      return nextState
    default:
      return state
  }
}

const app = combineReducers({
  tracks
})

export default app
