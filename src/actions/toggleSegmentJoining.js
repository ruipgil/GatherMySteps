const toggleSegmentJoining = (segmentId) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_JOINING'
  }
}

export default toggleSegmentJoining
