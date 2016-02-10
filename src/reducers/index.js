import { combineReducers } from 'redux'

const tracks = (state = [] , action) => {
  const getSegmentById = (id, state = state) => state.map((track) => track.segments.find((x) => x.id === action.segmentId)).find((x) => !!x)

  switch (action.type) {
    case 'ADD_TRACK':
      return [...state, action.track]
    case 'TOGGLE_SEGMENT_DISPLAY':
      let nextState = [...state]
      let segment = getSegmentById(action.segmentId, nextState)
      segment.display = !segment.display
      return nextState
    case 'TOGGLE_SEGMENT_EDITING':
      let nextStateA = [...state]
      let segmentA = getSegmentById(action.segmentId, nextStateA)
      console.log('here')
      segmentA.editing = !segmentA.editing
      return nextStateA
    default:
      return state
  }
}

const app = combineReducers({
tracks})

export default app
