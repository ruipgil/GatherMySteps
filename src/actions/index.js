export const COLORS = [
  '#a6cee3', '#1f78b4', '#b2df8a',
  '#33a02c', '#fb9a99', '#e31a1c',
  '#fdbf6f', '#ff7f00', '#cab2d6',
  '#6a3d9a', '#ffff99', '#b15928'
]
let _trackId = 0
let _segmentId = 0
export const addTrack = (track, file) => {
  let id = _trackId++
  return {
    type: 'ADD_TRACK',
    track: {
      id,
      segments: track.map((segment) => {
        let sId = _segmentId++
        return {
          id: sId,
          points: segment,
          display: true,
          start: segment[0].time,
          end: segment[segment.length - 1].time,
          color: COLORS[sId % COLORS.length],
          name: '',
          editing: false,
          spliting: false,
          joining: false
        }
      }),
      name: file.name
    }
  }
}

export const splitSegment = (segmentId, index) => {
  const sId = _segmentId++
  return {
    index,
    segmentId,
    segmentInfo: {
      id: sId,
      points: [],
      display: true,
      start: null,
      end: null,
      color: COLORS[sId % COLORS.length],
      name: '',
      editing: false,
      spliting: false,
      joining: false
    },
    type: 'SPLIT_SEGMENT'
  }
}

export const joinSegment = (segmentId, index) => {
  return {
    index,
    segmentId,
    type: 'JOIN_SEGMENT'
  }
}

export const toggleSegmentJoining = (segmentId) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_JOINING'
  }
}

export const toggleSegmentSpliting = (segmentId) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_SPLITING'
  }
}

export const toggleSegmentDisplay = (segmentId, value) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_DISPLAY'
  }
}

export const toggleSegmentEditing = (segmentId, value) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_EDITING'
  }
}

export const extendSegment = (segmentId, index, lat, lon) => {
  return {
    segmentId,
    index,
    lat,
    lon,
    type: 'EXTEND_SEGMENT_POINT'
  }
}
export const addSegmentPoint = (segmentId, index, lat, lon) => {
  return {
    segmentId,
    index,
    lat,
    lon,
    type: 'ADD_SEGMENT_POINT'
  }
}
export const removeSegmentPoint = (segmentId, index) => {
  return {
    segmentId,
    index,
    type: 'REMOVE_SEGMENT_POINT'
  }
}
export const changeSegmentPoint = (segmentId, index, lat, lon) => {
  return {
    segmentId,
    index,
    lat,
    lon,
    type: 'CHANGE_SEGMENT_POINT'
  }
}

export const removeSegment = (segmentId) => {
  return {
    segmentId,
    type: 'REMOVE_SEGMENT'
  }
}

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

export const useGoogleMaps = () => {
  return {
    type: 'USE_GOOGLE_MAPS'
  }
}

export const updateBounds = (bounds) => {
  return {
    bounds,
    type: 'UPDATE_BOUNDS'
  }
}

export const fitSegment = (segmentId) => {
  return {
    segmentId,
    type: 'FIT_SEGMENT'
  }
}

export const downloadTrack = (track) => {
  return {
    track,
    type: 'DOWNLOAD_TRACK'
  }
}
