import { combineReducers } from 'redux'

const tracks = (state = [] , action) => {
  const getSegmentById = (id, state = state) => state.map((track) => track.segments.find((x) => x.id === id)).find((x) => !!x)
  const getTrackBySegmentId = (id, state = state) => state.map((track) => track.segments.find((s) => s.id === id) ? track : null).find((x) => !!x)

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
      segmentA.editing = !segmentA.editing
      segmentA.spliting = false
      return nextStateA
    case 'CHANGE_SEGMENT_POINT':
      let nextStateB = [...state]
      let segmentB = getSegmentById(action.segmentId, nextStateB)
      segmentB.points[action.index].lat = action.lat
      segmentB.points[action.index].lon = action.lon
      return nextStateB
    case 'REMOVE_SEGMENT_POINT':
      let nextStateC = [...state]
      let segmentC = getSegmentById(action.segmentId, nextStateC)
      segmentC.points = segmentC.points.filter((_, i) => i !== action.index)
      return nextStateC
    case 'EXTEND_SEGMENT_POINT':
      let nextStateD = [...state]
      let segmentD = getSegmentById(action.segmentId, nextStateD)
      const extrapolateTime = (state, n) => {
        if (n === 0) {
          let prev = state[0].time
          let next = state[1].time
          let prediction = prev.clone().subtract(prev.diff(next))
          return prediction
        } else {
          let prev = state[state.length - 1].time
          let next = state[state.length - 2].time
          let prediction = prev.clone().add(prev.diff(next))
          return prediction
        }
      }

      let point = {
        lat: action.lat,
        lon: action.lon,
        time: extrapolateTime(segmentD.points, action.index)
      }
      if (action.index === 0) {
        segmentD.points.unshift(point)
      } else {
        segmentD.points.push(point)
      }
      return nextStateD

    case 'ADD_SEGMENT_POINT':
      let nextStateE = [...state]
      let segmentE = getSegmentById(action.segmentId, nextStateE)
      const extrapolateTimeA = (state, n) => {
        let prev = state[n - 1].time
        let next = state[n + 1].time
        let diff = prev.diff(next) / 2
        return prev.clone().add(diff)
      }

      let pointA = {
        lat: action.lat,
        lon: action.lon,
        time: extrapolateTimeA(segmentE.points, action.index)
      }
      segmentE.points.splice(action.index, 0, pointA)
      return nextStateE
    case 'REMOVE_SEGMENT':
      let track = state.map((track) => track.segments.find((s) => s.id === action.segmentId) ? track : null).find((x) => !!x)
      let stateF = [...state]
      if (track.segments.length === 1) {
        stateF.splice(stateF.indexOf(track), 1)
      } else {
        stateF.segments.splice(stateF.segments.indexOf(track.segment.find((s) => s.id === action.segmentId)), 1)
      }
      return stateF
    case 'SPLIT_SEGMENT':
      let nextStateG = [...state]
      let segmentG = getSegmentById(action.segmentId, nextStateG)
      let trackG = getTrackBySegmentId(action.segmentId, nextStateG)

      let rest = segmentG.points.splice(action.index)
      segmentG.end = segmentG.points[segmentG.points.length - 1].time
      segmentG.spliting = false

      let seg = action.segmentInfo
      seg.points = rest
      seg.start = rest[0].time
      seg.end = rest[rest.length - 1].time

      trackG.segments.push(seg)

      return nextStateG
    case 'TOGGLE_SEGMENT_SPLITING':
      let nextStateH = [...state]
      let segmentH = getSegmentById(action.segmentId, nextStateH)
      segmentH.spliting = !segmentH.spliting
      segmentH.editing = false
      return nextStateH

    default:
      return state
  }
}

const app = combineReducers({
tracks})

export default app
