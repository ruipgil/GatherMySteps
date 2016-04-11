import { Map, fromJS } from 'immutable'

const initialState = Map({})
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
    default:
      return state
  }
}

export default ui
