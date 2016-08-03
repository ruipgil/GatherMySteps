import { Set, fromJS } from 'immutable'

const initialState = fromJS({ highlighted: Set([]), alerts: [] })
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
      if (action.ref) {
        const index = state.get('alerts').findIndex((a) => a.ref === action.ref)
        if (index !== -1) {
          return state
        }
      }

      return state.update('alerts', (alerts) => alerts.push({ type: action.alertType, message: action.message, duration: action.duration, ref: action.ref }))

    case 'CENTER_MAP':
      return state.set('center', { lat: action.lat, lon: action.lon })
    case 'HIGHLIGHT_SEGMENT':
      return state.update('highlighted', (highlighted) => {
        return action.segmentsIds.reduce((highlighted, segId) => {
          return highlighted.add(segId)
        }, highlighted)
      })
    case 'DEHIGHLIGHT_SEGMENT':
      return state.update('highlighted', (highlighted) => {
        return action.segmentsIds.reduce((highlighted, segId) => {
          return highlighted.delete(segId)
        }, highlighted)
      })
    case 'TOGGLE_CONFIG':
      return state.set('showConfig', !state.get('showConfig'))
    case 'ADD_POINT_PROMPT':
      return state.set('pointPrompt', action.callback)
    case 'REMOVE_POINT_PROMPT':
      return state.delete('pointPrompt')
    default:
      return state
  }
}

export default ui
