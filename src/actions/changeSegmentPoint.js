const changeSegmentPoint = (segmentId, index, lat, lon) => {
  return {
    segmentId,
    index,
    lat,
    lon,
    type: 'CHANGE_SEGMENT_POINT'
  }
}

export default changeSegmentPoint
