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
    .set('initLIFE', action.life)
    .set('lifeQueue', action.lifeQueue)
    .set('life', '')
}

const updateConfig = (state, action) => {
  return state.set('config', new Map(action.config))
}

const setLife = (state, action) => {
  return state.set('life', action.text)
}

const ACTION_REACTION = {
  'ADVANCE_TO_ADJUST': advanceToAdjust,
  'ADVANCE_TO_ANNOTATE': advanceToAnnotate,
  'SET_SERVER_STATE': setServerState,
  'UPDATE_CONFIG': updateConfig,
  'SET_LIFE': setLife
}

const initialState = fromJS({
  step: -2,
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
