export const addSegmentPoint = (segmentId, index, lat, lon) => {
  return {
    segmentId,
    index,
    lat,
    lon,
    type: 'ADD_SEGMENT_POINT'
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

export const extendSegment = (segmentId, index, lat, lon) => {
  return {
    segmentId,
    index,
    lat,
    lon,
    type: 'EXTEND_SEGMENT_POINT'
  }
}

export const fitSegment = (segmentId) => {
  return {
    segmentId,
    type: 'FIT_SEGMENT'
  }
}

export const joinSegment = (segmentId, index, details) => {
  return {
    index,
    segmentId,
    details,
    type: 'JOIN_SEGMENT'
  }
}

export const removeSegment = (segmentId) => {
  return {
    segmentId,
    type: 'REMOVE_SEGMENT'
  }
}

export const removeSegmentPoint = (segmentId, index) => {
  return {
    segmentId,
    index,
    type: 'REMOVE_SEGMENT_POINT'
  }
}

export const splitSegment = (segmentId, index) => {
  return {
    index,
    segmentId,
    type: 'SPLIT_SEGMENT'
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

export const toggleSegmentJoining = (segmentId) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_JOINING'
  }
}

export const toggleSegmentPointDetails = (segmentId) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_POINT_DETAILS'
  }
}

export const toggleSegmentSpliting = (segmentId) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_SPLITING'
  }
}
