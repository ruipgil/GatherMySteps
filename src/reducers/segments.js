import {
  /*
  updateBoundsWithPoint,
  getSegmentById,
  getTrackBySegmentId,
  */
  calculateBoundsImmutable,
  createSegmentObj,
  calculateMetrics
} from './utils'
import {
  removeSegment as removeSegmentAction
} from '../actions/segments'
import { fromJS } from 'immutable'

const updateSegment = (state, id) => {
  return state.updateIn(['segments', id], (segment) => {
    const pts = segment.get('points')
    const metrics = calculateMetrics(pts.toJS())
    const bounds = calculateBoundsImmutable(pts)

    return segment
      .set('bounds', fromJS(bounds))
      .set('start', pts.get(0).get('time'))
      .set('end', pts.get(-1).get('time'))
      .set('metrics', fromJS(metrics))
  })
}

const changeSegmentPoint = (state, action) => {
  const id = action.segmentId
  state = state.setIn(['segments', id, 'points', action.index, 'lat'], action.lat)
  state = state.setIn(['segments', id, 'points', action.index, 'lon'], action.lon)
  return updateSegment(state, id)
}

const removeSegmentPoint = (state, action) => {
  const id = action.segmentId
  return updateSegment(state
    .deleteIn(['segments', id, 'points', action.index]), id)
}

const extendSegmentPoint = (state, action) => {
  const id = action.segmentId

  const extrapolateTime = (points, n) => {
    if (n === 0) {
      let prev = points.get(0).get('time')
      let next = points.get(1).get('time')
      let prediction = prev.clone().subtract(prev.diff(next))
      return prediction
    } else {
      let prev = points.get(-1).get('time')
      let next = points.get(-2).get('time')
      let prediction = prev.clone().add(prev.diff(next))
      return prediction
    }
  }

  let point = fromJS({
    lat: action.lat,
    lon: action.lon,
    time: extrapolateTime(state.get('segments').get(id).get('points'), action.index)
  })
  return updateSegment(state.updateIn(['segments', id, 'points'], (points) => {
    if (action.index === 0) {
      return points.unshift(point)
    } else {
      return points.push(point)
    }
  }), id)
}

const addSegmentPoint = (state, action) => {
  const id = action.segmentId
  const extrapolateTimeA = (points, n) => {
    let prev = points.get(n - 1).get('time')
    let next = points.get(n + 1).get('time')
    let diff = prev.diff(next) / 2
    return prev.clone().add(diff)
  }

  let pointA = {
    lat: action.lat,
    lon: action.lon,
    time: extrapolateTimeA(state.get('segments').get(id).get('points'), action.index)
  }

  return updateSegment(state.updateIn(['segments', id, 'points'], (points) => {
    return points.insert(action.index, fromJS(pointA))
  }), id)
}
const removeSegment = (state, action) => {
  const id = action.segmentId
  const trackId = state.get('segments').get(id).get('trackId')
  state = state
    .deleteIn(['segments', action.segmentId])
  if (state.get('tracks').get(trackId).get('segments').count() === 1) {
    state = state.deleteIn(['tracks', trackId])
  } else {
    state = state.updateIn(['tracks', trackId, 'segments'], (segments) => {
      return segments.delete(segments.indexOf(id))
    })
  }
  return state
}
const splitSegment = (state, action) => {
  const id = action.segmentId
  const segment = state.get('segments').get(id)
  let _points = segment.get('points')
  const rest = _points.slice(action.index, _points.count())
  console.log(action.index)
  state = state.updateIn(['segments', id, 'points'], (points) => {
    return points.slice(0, action.index + 1)
  })
  state = updateSegment(state, id)

  const segData = createSegmentObj(segment.get('trackId'), rest.toJS(), [], [], state.get('segments').count())
  state = state.setIn(['segments', segData.id], fromJS(segData))

  state = state.updateIn(['tracks', segment.get('trackId'), 'segments'], (segments) => {
    return segments.push(segData.id)
  })

  return toggleSegProp(state, id, 'spliting')
}

const joinSegment = (state, action) => {
  const { details } = action
  const toRemove = state.get('segments').get(details.segment)

  state = state.updateIn(['segments', action.segmentId, 'points'], (points) => {
    if (details.destiny !== 'START') {
      toRemove.get('points').forEach((p) => {
        points = points.push(p)
      })
    } else {
      toRemove.get('points').reverse().forEach((p) => {
        points = points.unshift(p)
      })
    }
    return points
  })

  state = toggleSegProp(state, action.segmentId, 'joining')
  state = segments(state, removeSegmentAction(toRemove.get('id')))

  return updateSegment(state, action.segmentId)
}

const updateTimeFilterSegment = (state, action) => {
  return state.updateIn(['segments', action.segmentId, 'timeFilter'], (f) => {
    return f.set(0, action.lower).set(1, action.upper)
  })
}

const toggleTimeFilter = (state, action) => {
  return state.updateIn(['segments', action.segmentId, 'showTimeFilter'], (f) => {
    return !f
  })
}

const defaultPropSet = ['editing', 'spliting', 'joining', 'pointDetails']
const toggleSegProp = (state, id, prop, propSet = defaultPropSet) => {
  const data = state.get('segments').get(id)
  propSet.forEach((p) => {
    state = state.setIn(['segments', id, p], (p === prop ? !data.get(p) : false))
  })
  return state
}

const toggleSegmentDisplay = (state, action) => {
  const id = action.segmentId
  state = toggleSegProp(state, id, 'display')
  return state.setIn(['segments', id, 'display'], !state.get('segments').get(id).get('display'))
}

const toggleSegmentEditing = (state, action) => {
  return toggleSegProp(state, action.segmentId, 'editing')
}

const toggleSegmentPointDetails = (state, action) => {
  return toggleSegProp(state, action.segmentId, 'pointDetails')
}

const toggleSegmentSpliting = (state, action) => {
  return toggleSegProp(state, action.segmentId, 'spliting')
}

const toggleSegmentJoining = (state, action) => {
  const id = action.segmentId
  const segment = state.get('segments').get(id)
  const trackId = segment.get('trackId')
  const track = state.get('tracks').get(trackId)

  if (track.get('segments').count() >= 1) {
    let possibilities = []
    let candidates = track.get('segments').toJS()
    candidates.splice(candidates.indexOf(id), 1)

    let sStart = segment.get('start')
    let sEnd = segment.get('end')

    let closerToStart
    let closerToEnd
    let t_closerToStart = Infinity
    let t_closerToEnd = Infinity
    candidates.forEach((c, i) => {
      const _c = state.get('segments').get(c)
      const start = _c.get('start')
      const end = _c.get('end')

      let startDiff = start.diff(sEnd)
      let endDiff = end.diff(sStart)

      if (startDiff >= 0 && startDiff < t_closerToStart) {
        t_closerToStart = startDiff
        closerToStart = _c.get('id')
      } else if (endDiff <= 0 && endDiff < t_closerToEnd) {
        t_closerToEnd = endDiff
        closerToEnd = _c.get('id')
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

    state = state.setIn(['segments', id, 'joinPossible'], possibilities)
    return toggleSegProp(state, action.segmentId, 'joining')
  } else {
    alert('Can not join with any segment of the same track')
  }
  return state
}

const ACTION_REACTION = {
  'TOGGLE_SEGMENT_DISPLAY': toggleSegmentDisplay,
  'TOGGLE_SEGMENT_EDITING': toggleSegmentEditing,
  'TOGGLE_SEGMENT_SPLITING': toggleSegmentSpliting,
  'TOGGLE_SEGMENT_JOINING': toggleSegmentJoining,
  'TOGGLE_SEGMENT_POINT_DETAILS': toggleSegmentPointDetails,

  'CHANGE_SEGMENT_POINT': changeSegmentPoint,
  'REMOVE_SEGMENT_POINT': removeSegmentPoint,
  'EXTEND_SEGMENT_POINT': extendSegmentPoint,
  'ADD_SEGMENT_POINT': addSegmentPoint,

  'REMOVE_SEGMENT': removeSegment,
  'SPLIT_SEGMENT': splitSegment,
  'JOIN_SEGMENT': joinSegment,
  'TOGGLE_TIME_FILTER': toggleTimeFilter,
  'UPDATE_TIME_FILTER_SEGMENT': updateTimeFilterSegment
}

const segments = (state = [], action) => {
  if (ACTION_REACTION[action.type]) {
    return ACTION_REACTION[action.type](state, action)
  } else {
    return state
  }
}

export default segments
