const addSegmentPoint = (segmentId, index, lat, lon) => {
  return {
    segmentId,
    index,
    lat,
    lon,
    type: 'ADD_SEGMENT_POINT'
  }
}

export default addSegmentPoint
