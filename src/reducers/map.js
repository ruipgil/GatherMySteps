import { Record, List, Set } from 'immutable'
import {
  CENTER_MAP,
  UPDATE_BOUNDS,
  CHANGE_PROVIDER,
  HIGHLIGHT_POINT,
  DEFAULT_PROVIDER,
  DEHIGHLIGHT_POINT,
  HIGHLIGHT_SEGMENT,
  DEHIGHLIGHT_SEGMENT,
  ADD_POINT_PROMPT,
  REMOVE_POINT_PROMPT
} from 'actions/map'

const changeSegmentHighlight = (state, action) => {
  let fn
  if (action.type === HIGHLIGHT_SEGMENT) {
    fn = (highlighted, segId) => highlighted.add(segId)
  } else {
    fn = (highlighted, segId) => highlighted.delete(segId)
  }
  return state.update('highlighted', (highlighted) => {
    return action.segmentsIds.reduce((highlighted, segId) => {
      return fn(highlighted, segId)
    }, highlighted.clear())
  })
}

const changePointHighlight = (state, action) => {
  let fn
  if (action.type === HIGHLIGHT_POINT) {
    fn = (highlighted, point) => highlighted.push(point)
  } else {
    fn = (highlighted, point) => highlighted.remove(highlighted.indexOf(point))
  }
  return state.update('highlightedPoints', (highlighted) => {
    return action.points.reduce((highlighted, points) => {
      return fn(highlighted, points)
    }, highlighted.clear())
  })
}

const MapRecord = new Record({
  bounds: undefined,
  center: undefined,
  provider: DEFAULT_PROVIDER,
  pointPrompt: undefined,
  highlighted: new Set([]),
  highlightedPoints: new List([])
})

const INITIAL_STATE = new MapRecord()

const map = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CHANGE_PROVIDER:
      return state.set('provider', action.provider)
    case UPDATE_BOUNDS:
      return state.set('bounds', action.bounds)
    case CENTER_MAP:
      return state.set('center', { lat: action.lat, lon: action.lon })
    case HIGHLIGHT_SEGMENT:
    case DEHIGHLIGHT_SEGMENT:
      return changeSegmentHighlight(state, action)
    case HIGHLIGHT_POINT:
    case DEHIGHLIGHT_POINT:
      return changePointHighlight(state, action)
    case ADD_POINT_PROMPT:
      return state.set('pointPrompt', action.callback)
    case REMOVE_POINT_PROMPT:
      return state.set('pointPrompt', null)
    default:
      return state
  }
}

export default map
