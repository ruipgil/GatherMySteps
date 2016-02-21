const toggleSegmentEditing = (segmentId, value) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_EDITING'
  }
}

export default toggleSegmentEditing
