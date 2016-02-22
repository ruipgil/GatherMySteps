const max = (a, b) => a >= b ? a : b
const min = (a, b) => a <= b ? a : b
const updateBoundsWithPoint = (point, bounds) => {
  return [
    { lat: min(bounds.lat[0], point.lat),
      lon: min(bounds.lon[0], point.lon)
    },
    { lat: max(bounds.lat[1], point.lat),
      lon: max(bounds.lon[1], point.lon)
    }
  ]
}

const calculateBounds = (points) => {
  let bounds = [{lat: Infinity, lon: Infinity}, {lat: -Infinity, lon: -Infinity}]
  points
  .map((t) => { return {lat: t.lat, lon: t.lon} })
  .forEach((elm) => {
    bounds[0].lat = min(bounds[0].lat, elm.lat)
    bounds[0].lon = min(bounds[0].lon, elm.lon)
    bounds[1].lat = max(bounds[1].lat, elm.lat)
    bounds[1].lon = max(bounds[1].lon, elm.lon)
  })
  return bounds
}

const getSegmentById = (id, state) => state.map((track) => track.segments.find((x) => x.id === id)).find((x) => !!x)
const getTrackBySegmentId = (id, state) => state.map((track) => track.segments.find((s) => s.id === id) ? track : null).find((x) => !!x)

const addTrack = (state, action) => {
  action.track.segments.forEach((segment) => {
    segment.bounds = calculateBounds(segment.points)
  })
  return [...state, action.track]
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
  segment.editing = !segment.editing
  segment.spliting = false
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

  let seg = action.segmentInfo
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
  segment.spliting = !segment.spliting
  segment.editing = false
  return nextState
}

const toggleSegmentJoining = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  segment.joining = !segment.joining
  segment.editing = false
  segment.spliting = false
  return nextState
}

const toggleSegmentPointDetails = (state, action) => {
  let nextState = [...state]
  let segment = getSegmentById(action.segmentId, nextState)
  segment.pointDetails = !segment.pointDetails
  segment.joining = false
  segment.editing = false
  segment.spliting = false
  return nextState
}

const ACTION_REACTION = {
  'ADD_TRACK': addTrack,
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
  'TOGGLE_SEGMENT_POINT_DETAILS': toggleSegmentPointDetails

}

const tracks = (state = [], action) => {
  if (ACTION_REACTION[action.type]) {
    return ACTION_REACTION[action.type](state, action)
  } else {
    return state
  }
}

export default tracks
