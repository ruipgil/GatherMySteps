import { ADJUST_STAGE, ANNOTATE_STAGE } from '../constants'

const advanceToAdjust = (state, action) => {
  return ADJUST_STAGE
}

const advanceToAnnotate = (state, action) => {
  return ANNOTATE_STAGE
}

const ACTION_REACTION = {
  'ADVANCE_TO_ADJUST': advanceToAdjust,
  'ADVANCE_TO_ANNOTATE': advanceToAnnotate
}

const progress = (state = 0, action) => {
  if (ACTION_REACTION[action.type]) {
    return ACTION_REACTION[action.type](state, action)
  } else {
    return state
  }
}

export default progress
