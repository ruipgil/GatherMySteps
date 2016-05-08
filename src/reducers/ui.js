import { fromJS } from 'immutable'

const initialState = fromJS({ alerts: [] })
const ui = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_MAP':
      return state.set('map', action.to)
    case 'USE_OSM_MAPS':
      return state.set('map', 'osm')
    case 'USE_GOOGLE_SATTELITE_MAPS':
      return state.set('map', 'google_sattelite')
    case 'USE_GOOGLE_HYBRID_MAPS':
      return state.set('map', 'google_hybrid')
    case 'USE_GOOGLE_TERRAIN_MAPS':
      return state.set('map', 'google_terrain')
    case 'USE_GOOGLE_ROAD_MAPS':
      return state.set('map', 'google_road')
    case 'UPDATE_BOUNDS':
      return state.set('bounds', fromJS(action.bounds))
    case 'UPDATE_INTERNAL_BOUNDS':
      return state.set('internalBounds', action.bounds)
    case 'SHOW_TRACK_DETAILS':
      return state.set('details', true)
    case 'HIDE_TRACK_DETAILS':
      return state.set('details', false)
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
      return state.update('alerts', (alerts) => alerts.push({ type: action.alertType, message: action.message, duration: action.duration, ref: action.duration }))
    default:
      return state
  }
}

export default ui
