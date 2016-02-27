import { createTrackObj } from './utils'

const addTrack = (state, action) => {
  let { name, segments } = action
  return [...state, createTrackObj(name, segments)]
}

const updateTrackName = (state, action) => {
  let nextState = [...state]
  let track = nextState.find((t) => t.id === action.trackId)
  track.name = action.name
  return nextState
}

const toggleTrackRenaming = (state, action) => {
  let nextState = [...state]
  let track = nextState.find((t) => t.id === action.trackId)
  track.renaming = !track.renaming
  return nextState
}

const ACTION_REACTION = {
  'ADD_TRACK': addTrack,
  'TOGGLE_TRACK_RENAMING': toggleTrackRenaming,
  'UPDATE_TRACK_NAME': updateTrackName

}

import segments from './segments'

const tracks = (state = [], action) => {
  if (ACTION_REACTION[action.type]) {
    return ACTION_REACTION[action.type](state, action)
  } else {
    return segments(state, action)
  }
}

export default tracks
