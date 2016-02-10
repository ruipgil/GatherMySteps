import { combineReducers } from 'redux'

const tracks = (state = [] , action) => {
  switch (action.type) {
    case 'ADD_TRACK':
      return [...state, action.track]
    case 'TOGGLE_SEGMENT_DISPLAY':
      let nextState = [...state]
      let segment = nextState.map((track) => track.segments.find((x) => x.id === action.segmentId)).find((x) => !!x)
      segment.display = !segment.display
      return nextState
    default:
      return state
  }
}

const app = combineReducers({
tracks})

export default app
