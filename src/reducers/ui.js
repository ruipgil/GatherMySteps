import { fromJS } from 'immutable'

const initialState = fromJS({
  alerts: [],
  transportationModes: []
})
const ui = (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_REMAINING_TRACKS':
      return state.set('showRemainingTracks', !state.get('showRemainingTracks'))

    case 'REMOVE_ALERT':
      return state.update('alerts', (alerts) => {
        let index
        if (action.alert) {
          index = alerts.findIndex((a) => a === action.alert)
        } else if (action.ref) {
          index = alerts.findIndex((a) => a.ref === action.ref)
        }
        if (index !== undefined) {
          return alerts.delete(index)
        } else {
          return alerts
        }
      })

    case 'ADD_ALERT':
      if (action.ref) {
        const index = state.get('alerts').findIndex((a) => a.ref === action.ref)
        if (index !== -1) {
          return state
        }
      }
      return state.update('alerts', (alerts) => alerts.push({ type: action.alertType, message: action.message, duration: action.duration, ref: action.ref }))

    case 'TOGGLE_CONFIG':
      return state.set('showConfig', !state.get('showConfig'))

    default:
      return state
  }
}

export default ui
