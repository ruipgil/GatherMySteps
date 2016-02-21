const extendSegment = (segmentId, index, lat, lon) => {
  return {
    segmentId,
    index,
    lat,
    lon,
    type: 'EXTEND_SEGMENT_POINT'
  }
}

export default extendSegment
