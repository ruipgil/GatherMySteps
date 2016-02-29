import { Map } from 'immutable'

const initialState = Map({})
const ui = (state = initialState, action) => {
  switch (action.type) {
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
      return state.set('bounds', action.bounds)
    default:
      return state
  }
}

export default ui
