import { Map } from 'immutable'
import { createTrackObj } from 'records'
import { addTrack as addTrackAction } from '../actions/tracks'

const addTrack = (state, action) => {
  let { name, segments, locations, transModes } = action
  let track = createTrackObj(name, segments, locations, transModes, state.get('segments').count())
  const ctrack = track.track
  const csegments = track.segments
  state = state.setIn(['tracks', ctrack.get('id')], ctrack)
  csegments.forEach((cs) => {
    state = state.setIn(['segments', cs.get('id')], cs)
  })

  return state
}

const addMultipleTracks = (state, action) => {
  return action.tracks.reduce((state, track) => {
    const { segments, name } = track
    const action = addTrackAction(segments[0], name)
    return tracks(state, action)
  }, state)
}

const updateTrackName = (state, action) => {
  return state.setIn(['tracks', action.trackId, 'name'], action.name)
}

const toggleTrackRenaming = (state, action) => {
  let id = action.trackId
  return state.setIn(['tracks', action.trackId, 'renaming'], !state.get('tracks').get(id).get('renaming'))
}

const removeTracksFor = (state, action) => {
  state = state
    .updateIn(['tracks'], (tracks) => {
      return tracks.clear()
    })
    .updateIn(['segments'], (segments) => {
      return segments.clear()
    })

  const { segments, name } = action
  const points = segments.map((s) => s.points)
  const transportationModes = segments.map((s) => s.transportationModes)
  const locations = segments.map((s) => [s.locationFrom, s.locationTo])
  const act = addTrackAction(points, name, locations, transportationModes)
  return addTrack(state, act)
}

const undo = (state, action) => {
  let toPut = state.get('history').get('past').get(-1)
  if (toPut) {
    return toPut.undo(toPut, state)
    .updateIn(['history', 'past'], (past) => past.pop())
    .updateIn(['history', 'future'], (future) => {
      future = future.push(toPut)
      if (UNDO_LIMIT !== Infinity) {
        return future.slice(future.count() - UNDO_LIMIT)
      } else {
        return future
      }
    })
  } else {
    return state
  }
}

const redo = (state, action) => {
  return state
  .updateIn(['history', 'future'], (future) => future.pop())
}

const updateLIFE = (state, action) => {
  const { text, warning } = action
  return state.set('LIFE', new Map({ text, warning }))
}

const removeTrack = (state, action) => {
  const { trackId } = action

  action.undo = (self, newState) => {
    return state
  }

  let cState = state
  state.get('tracks').get(trackId).get('segments').forEach((seg) => {
    cState = cState.deleteIn(['segments', seg])
  })
  return cState.deleteIn(['tracks', trackId])
}

const ACTION_REACTION = {
  'ADD_TRACK': addTrack,
  'ADD_MULTIPLE_TRACKS': addMultipleTracks,
  'TOGGLE_TRACK_RENAMING': toggleTrackRenaming,
  'UPDATE_TRACK_NAME': updateTrackName,
  'REMOVE_TRACKS_FOR': removeTracksFor,
  'REMOVE_TRACK': removeTrack,
  'UNDO': undo,
  'REDO': redo,

  'UPDATE_LIFE': updateLIFE
}

import segments from './segments'
import { fromJS } from 'immutable'

const initalState = fromJS({
  tracks: {},
  segments: {},
  history: {
    past: [],
    future: []
  }
})

// Number or Infinity
const UNDO_LIMIT = 50

const tracks = (state = initalState, action) => {
  let result
  if (ACTION_REACTION[action.type]) {
    result = ACTION_REACTION[action.type](state, action)
  } else {
    result = segments(state, action)
  }
  if (result !== state && action.undo) {
    return result.updateIn(['history', 'past'], (past) => {
      past = past.push(action)
      if (UNDO_LIMIT !== Infinity) {
        return past.slice(past.count() - UNDO_LIMIT)
      } else {
        return past
      }
    })
  } else {
    return result
  }
}

export default tracks
