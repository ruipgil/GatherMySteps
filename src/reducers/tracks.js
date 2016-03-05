import { createTrackObj } from './utils'

const addTrack = (state, action) => {
  let { name, segments } = action
  let track = createTrackObj(name, segments)
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
  return addTrack(state, addTrackAction(action.segments, action.name))
}

const ACTION_REACTION = {
  'ADD_TRACK': addTrack,
  'TOGGLE_TRACK_RENAMING': toggleTrackRenaming,
  'UPDATE_TRACK_NAME': updateTrackName,
  'REMOVE_TRACKS_FOR': removeTracksFor
}

import segments from './segments'
import { fromJS } from 'immutable'

const initalState = fromJS({
  tracks: {},
  segments: {}
})
const tracks = (state = initalState, action) => {
  if (ACTION_REACTION[action.type]) {
    return ACTION_REACTION[action.type](state, action)
  } else {
    return segments(state, action)
  }
}

export default tracks
