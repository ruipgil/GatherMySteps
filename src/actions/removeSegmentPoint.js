const removeSegmentPoint = (segmentId, index) => {
  return {
    segmentId,
    index,
    type: 'REMOVE_SEGMENT_POINT'
  }
}

export default removeSegmentPoint
