export const CENTER_MAP = 'CENTER_MAP'
export const UPDATE_BOUNDS = 'UPDATE_BOUNDS'
export const CHANGE_PROVIDER = 'CHANGE_PROVIDER'
export const HIGHLIGHT_POINT = 'HIGHLIGHT_POINT'
export const DEHIGHLIGHT_POINT = 'DEHIGHLIGHT_POINT'
export const ADD_POINT_PROMPT = 'ADD_POINT_PROMPT'
export const REMOVE_POINT_PROMPT = 'REMOVE_POINT_PROMPT'
export const HIGHLIGHT_SEGMENT = 'HIGHLIGHT_SEGMENT'
export const DEHIGHLIGHT_SEGMENT = 'DEHIGHLIGHT_SEGMENT'

export const OSM_PROVIDER = 'OSM_VANILLA'
export const DEFAULT_PROVIDER = OSM_PROVIDER
export const AVAILABLE_PROVIDERS = [
  OSM_PROVIDER
]

export const centerMap = (lat, lon) => ({
  lat,
  lon,
  type: CENTER_MAP
})

export const updateBounds = (bounds) => ({
  bounds,
  type: UPDATE_BOUNDS
})

export const highlightSegment = (segmentsIds) => ({
  segmentsIds,
  type: HIGHLIGHT_SEGMENT
})

export const dehighlightSegment = (segmentsIds) => ({
  segmentsIds,
  type: DEHIGHLIGHT_SEGMENT
})

export const highlightPoint = (points) => ({
  points,
  type: HIGHLIGHT_POINT
})

export const dehighlightPoint = (points) => ({
  points,
  type: DEHIGHLIGHT_POINT
})

export const addPointPrompt = (callback) => ({
  callback,
  type: ADD_POINT_PROMPT
})

export const removePointPrompt = () => ({
  type: REMOVE_POINT_PROMPT
})

export const changeProvider = (provider) => {
  if (AVAILABLE_PROVIDERS.indexOf(provider) === -1) {
    throw new Error('Invalid map provider')
  }

  return {
    provider,
    type: CHANGE_PROVIDER
  }
}
