import {
  updateBoundsWithPoint,
  calculateBounds,
  getSegmentById,
  getTrackBySegmentId,
  createSegmentObj
} from './utils'
import { removeSegment as removeSegmentAction } from '../actions/segments'

const updateSegment = (segment) => {
  segment.start = segment.points[0].time
  segment.end = segment.points[segment.points.length - 1].time
  segment.bounds = calculateBounds(segment.points)
}

const defaultPropSet = ['editing', 'spliting', 'joining', 'pointDetails']
const toggleSegProp = (segment, prop, propSet = defaultPropSet) => {
  propSet.forEach((p) => {
    segment[p] = (p === prop ? !segment[p] : false)
  })
}

const toggleSegmentDisplay = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  segment.display = !segment.display
  return nextState
}

const toggleSegmentEditing = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  toggleSegProp(segment, 'editing')
  return nextState
}

const changeSegmentPoint = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  segment.points[action.index].lat = action.lat
  segment.points[action.index].lon = action.lon
  segment.bounds = updateBoundsWithPoint(segment.points[action.index], segment.bounds)
  return nextState
}

const removeSegmentPoint = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  segment.points = segment.points.filter((_, i) => i !== action.index)
  segment.bounds = calculateBounds(segment.points)
  return nextState
}

const extendSegmentPoint = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
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
    time: extrapolateTime(segment.points, action.index)
  }
  segment.bounds = updateBoundsWithPoint(point, segment.bounds)
  if (action.index === 0) {
    segment.points.unshift(point)
  } else {
    segment.points.push(point)
  }
  return nextState
}

const addSegmentPoint = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  const extrapolateTimeA = (state, n) => {
    let prev = state[n - 1].time
    let next = state[n + 1].time
    let diff = prev.diff(next) / 2
    return prev.clone().add(diff)
  }

  let pointA = {
    lat: action.lat,
    lon: action.lon,
    time: extrapolateTimeA(segment.points, action.index)
  }
  segment.bounds = updateBoundsWithPoint(pointA, segment.bounds)
  segment.points.splice(action.index, 0, pointA)
  return nextState
}
const removeSegment = (state, action) => {
  let track = state.map((track) => track.segments.find((s) => s.id === action.segmentId) ? track : null).find((x) => !!x)
  let stateF = [...state]
  if (track.segments.length === 1) {
    stateF.splice(stateF.indexOf(track), 1)
  } else {
    let ix = track.segments.indexOf(track.segments.find((s) => s.id === action.segmentId))
    track.segments.splice(ix, 1)
  }
  return stateF
}
const splitSegment = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  let trackG = getTrackBySegmentId(action.segmentId, nextState)

  let rest = segment.points.splice(action.index)
  segment.points.push(rest[0])
  segment.end = segment.points[segment.points.length - 1].time
  segment.spliting = false
  segment.bounds = calculateBounds(segment.points)

  let seg = createSegmentObj(rest)
  seg.points = rest
  seg.start = rest[0].time
  seg.end = rest[rest.length - 1].time
  seg.bounds = calculateBounds(seg.points)

  trackG.segments.push(seg)

  return nextState
}
const toggleSegmentSpliting = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  toggleSegProp(segment, 'spliting')
  return nextState
}

const toggleSegmentJoining = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  let track = getTrackBySegmentId(action.segmentId, nextState)
  if (track.segments.length > 1) {
    let possibilities = []
    let candidates = [...track.segments]
    candidates.splice(candidates.indexOf(segment), 1)

    let sStart = segment.start
    let sEnd = segment.end

    let closerToStart
    let closerToEnd
    let t_closerToStart = Infinity
    let t_closerToEnd = Infinity
    candidates.forEach((c, i) => {
      let { start, end } = c
      let startDiff = start.diff(sEnd)
      let endDiff = end.diff(sStart)

      if (startDiff >= 0 && startDiff < t_closerToStart) {
        t_closerToStart = startDiff
        closerToStart = c.id
      } else if (endDiff <= 0 && endDiff < t_closerToEnd) {
        t_closerToEnd = endDiff
        closerToEnd = c.id
      }
    })

    if (closerToStart !== undefined) {
      possibilities.push({
        segment: closerToStart,
        destiny: 'END',
        show: 'END'
      })
    }
    if (closerToEnd !== undefined) {
      possibilities.push({
        segment: closerToEnd,
        destiny: 'START',
        show: 'START'
      })
    }

    segment.joinPossible = possibilities
    toggleSegProp(segment, 'joining')
  }
  return nextState
}

const joinSegment = (state, action) => {
  let nextState = [...state]
  const { details } = action
  let segment = getSegmentById(action.segmentId, nextState)
  let toJoin = getSegmentById(details.segment, nextState)
  let index = details.destiny !== 'START' ? toJoin.points.length - 1 : 0
  let toRemove = details.segment
  segment.points.splice(index, 0, ...toJoin.points)
  updateSegment(segment)
  segment.joining = false
  return segments(nextState, removeSegmentAction(toRemove))
}

const toggleSegmentPointDetails = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  toggleSegProp(segment, 'pointDetails')
  return nextState
}

const ACTION_REACTION = {
  'TOGGLE_SEGMENT_DISPLAY': toggleSegmentDisplay,
  'TOGGLE_SEGMENT_EDITING': toggleSegmentEditing,
  'CHANGE_SEGMENT_POINT': changeSegmentPoint,
  'REMOVE_SEGMENT_POINT': removeSegmentPoint,
  'EXTEND_SEGMENT_POINT': extendSegmentPoint,
  'ADD_SEGMENT_POINT': addSegmentPoint,
  'REMOVE_SEGMENT': removeSegment,
  'SPLIT_SEGMENT': splitSegment,
  'TOGGLE_SEGMENT_SPLITING': toggleSegmentSpliting,
  'TOGGLE_SEGMENT_JOINING': toggleSegmentJoining,
  'TOGGLE_SEGMENT_POINT_DETAILS': toggleSegmentPointDetails,
  'JOIN_SEGMENT': joinSegment
}

const segments = (state = [], action) => {
  if (ACTION_REACTION[action.type]) {
    return ACTION_REACTION[action.type](state, action)
  } else {
    return state
  }
}

export default segments
