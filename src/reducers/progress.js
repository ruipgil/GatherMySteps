import { Map, fromJS } from 'immutable'
import { ADJUST_STAGE, ANNOTATE_STAGE } from '../constants'

const advanceToAdjust = (state, action) => {
  return state.set('step', ADJUST_STAGE)
}

const advanceToAnnotate = (state, action) => {
  return state.set('step', ANNOTATE_STAGE)
}

const setServerState = (state, action) => {
  return state.set('step', action.step)
    .set('remainingTracks', fromJS(action.tracksRemaining))
    .set('daySelected', action.daySelected)
}

const updateConfig = (state, action) => {
  return state.set('config', new Map(action.config))
}

const ACTION_REACTION = {
  'ADVANCE_TO_ADJUST': advanceToAdjust,
  'ADVANCE_TO_ANNOTATE': advanceToAnnotate,
  'SET_SERVER_STATE': setServerState,
  'UPDATE_CONFIG': updateConfig
}

const initialState = fromJS({
  step: 0,
  remainingTracks: [],
  server: 'http://localhost:5000'
})
const progress = (state = initialState, action) => {
  if (ACTION_REACTION[action.type]) {
    return ACTION_REACTION[action.type](state, action)
  } else {
    return state
  }
}

export default progress
