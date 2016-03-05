const advanceToAdjust = (state, action) => {
  return 1
}

const ACTION_REACTION = {
  'ADVANCE_TO_ADJUST': advanceToAdjust
}

const progress = (state = 0, action) => {
  if (ACTION_REACTION[action.type]) {
    return ACTION_REACTION[action.type](state, action)
  } else {
    return state
  }
}

export default progress
