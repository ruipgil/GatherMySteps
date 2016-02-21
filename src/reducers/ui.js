const ui = (state = {}, action) => {
  switch (action.type) {
    case 'USE_GOOGLE_MAPS':
      state.map = 'google'
      return Object.assign({}, state)
    case 'USE_OSM_MAPS':
      state.map = 'map'
      return Object.assign({}, state)
    case 'USE_GOOGLE_ROAD_MAPS':
      state.map = 'google_road'
      return Object.assign({}, state)
    case 'UPDATE_BOUNDS':
      state.bounds = action.bounds
      return Object.assign({}, state)
    default:
      return state
  }
}

export default ui
