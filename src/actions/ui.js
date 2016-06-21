import { getConfig } from 'actions/progress'

export const useOSMMaps = () => {
  return {
    type: 'USE_OSM_MAPS'
  }
}

export const useGoogleRoadMaps = () => {
  return {
    type: 'USE_GOOGLE_ROAD_MAPS'
  }
}

export const useGoogleTerrainMaps = () => {
  return {
    type: 'USE_GOOGLE_TERRAIN_MAPS'
  }
}

export const useGoogleHybridMaps = () => {
  return {
    type: 'USE_GOOGLE_HYBRID_MAPS'
  }
}

export const useGoogleSatelliteMaps = () => {
  return {
    type: 'USE_GOOGLE_SATTELITE_MAPS'
  }
}

export const changeMap = (newType) => {
  return {
    type: 'CHANGE_MAP',
    to: newType
  }
}

const min = (a, b) => a > b ? b : a
const max = (a, b) => a < b ? b : a

export const fitSegments = (...segmentIds) => {
  return (dispatch, getState) => {
    const ss = getState().get('tracks').get('segments')
    const bounds = segmentIds
    .map((s) => ss.get(s).get('bounds'))
    .reduce((prev, b) => {
      prev[0][0] = min(prev[0][0], b.get(0).get('lat'))
      prev[0][1] = min(prev[0][1], b.get(0).get('lon'))
      prev[1][0] = max(prev[1][0], b.get(1).get('lat'))
      prev[1][1] = max(prev[1][1], b.get(1).get('lon'))
      return prev
    }, [[Infinity, Infinity], [-Infinity, -Infinity]])

    dispatch(updateBounds(bounds))
  }
}

export const updateBounds = (bounds) => {
  return {
    bounds,
    type: 'UPDATE_BOUNDS'
  }
}

export const updateInternalBounds = (bounds) => {
  return {
    bounds,
    type: 'UPDATE_INTERNAL_BOUNDS'
  }
}

export const hideDetails = () => {
  return {
    type: 'HIDE_TRACK_DETAILS'
  }
}
export const showDetails = () => {
  return {
    type: 'SHOW_TRACK_DETAILS'
  }
}
export const toggleRemainingTracks = () => {
  return {
    type: 'TOGGLE_REMAINING_TRACKS'
  }
}

export const addAlert = (message, type = 'error', duration = 5, ref = undefined) => {
  return {
    message,
    duration,
    ref,
    alertType: type,
    type: 'ADD_ALERT'
  }
}

export const removeAlert = (alert, ref) => {
  return {
    alert,
    ref,
    type: 'REMOVE_ALERT'
  }
}

export const centerMap = (lat, lon) => {
  return {
    lat,
    lon,
    type: 'CENTER_MAP'
  }
}

export const highlightSegment = (segmentId) => ({
  segmentId,
  type: 'HIGHLIGHT_SEGMENT'
})

export const dehighlightSegment = (segmentId) => ({
  segmentId,
  type: 'DEHIGHLIGHT_SEGMENT'
})

export const toggleConfig = () => {
  const action = {
    type: 'TOGGLE_CONFIG'
  }
  return (dispatch, getState) => {
    if (!getState().get('ui').get('showConfig')) {
      dispatch(getConfig())
        .then(() => dispatch(action))
    } else {
      dispatch(action)
    }
  }
}

