const toggleSegmentDisplay = (segmentId, value) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_DISPLAY'
  }
}

export default toggleSegmentDisplay
