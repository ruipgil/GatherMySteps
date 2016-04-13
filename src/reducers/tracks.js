import { createTrackObj } from './utils'

const addTrack = (state, action) => {
  let { name, segments, locations, transModes } = action
  let track = createTrackObj(name, segments, locations, transModes, state.get('segments').count())
  const ctrack = track.track
  const csegments = track.segments
  state = state.setIn(['tracks', ctrack.id], fromJS(ctrack))
  csegments.forEach((cs) => {
    state = state.setIn(['segments', cs.id], fromJS(cs))
  })
  return state
}

const updateTrackName = (state, action) => {
  return state.setIn(['tracks', action.trackId, 'name'], action.name)
}

const toggleTrackRenaming = (state, action) => {
  let id = action.trackId
  return state.setIn(['tracks', action.trackId, 'renaming'], !state.get('tracks').get(id).get('renaming'))
}

import { addTrack as addTrackAction } from '../actions/tracks'

const removeTracksFor = (state, action) => {
  state = state
    .updateIn(['tracks'], (tracks) => {
      return tracks.clear()
    })
    .updateIn(['segments'], (segments) => {
      return segments.clear()
    })
  return addTrack(state, addTrackAction(action.segments, action.name, action.locations, action.transModes))
}

const undo = (state, action) => {
  let toPut = state.get('history').get('past').get(-1)
  if (toPut) {
    return state
      .set('tracks', toPut.get('tracks'))
      .set('segments', toPut.get('segments'))
      .updateIn(['history', 'past'], (past) => {
        return past.pop()
      })
      .updateIn(['history', 'future'], (future) => {
        return future.push(state)
      })
  } else {
    return state
  }
}

const redo = (state, action) => {
  let toPut = state.get('history').get('future').get(-1)
  if (toPut) {
    return state
      .set('tracks', toPut.get('tracks'))
      .set('segments', toPut.get('segments'))
      .updateIn(['history', 'future'], (future) => {
        return future.pop()
      })
  } else {
    return state
  }
}

const ACTION_REACTION = {
  'ADD_TRACK': addTrack,
  'TOGGLE_TRACK_RENAMING': toggleTrackRenaming,
  'UPDATE_TRACK_NAME': updateTrackName,
  'REMOVE_TRACKS_FOR': removeTracksFor,
  'UNDO': undo,
  'REDO': redo
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

import { TOGGLE_TRACK_RENAMING, TOGGLE_SEGMENT_DISPLAY, TOGGLE_SEGMENT_SPLITING, TOGGLE_SEGMENT_POINT_DETAILS, TOGGLE_SEGMENT_JOINING, TOGGLE_SEGMENT_EDITING } from 'actions'

const BLACK_LISTED_ACTIONS = [TOGGLE_TRACK_RENAMING, TOGGLE_SEGMENT_DISPLAY, TOGGLE_SEGMENT_SPLITING, TOGGLE_SEGMENT_POINT_DETAILS, TOGGLE_SEGMENT_JOINING, TOGGLE_SEGMENT_EDITING, 'UNDO', 'REDO']
const tracks = (state = initalState, action) => {
  let result
  if (ACTION_REACTION[action.type]) {
    result = ACTION_REACTION[action.type](state, action)
  } else {
    result = segments(state, action)
  }
  if (result !== state && BLACK_LISTED_ACTIONS.indexOf(action.type) === -1) {
    return result.updateIn(['history', 'past'], (past) => {
      return past.push(state)
    })
  } else {
    return result
  }
}

export default tracks
