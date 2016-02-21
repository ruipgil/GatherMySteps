const removeSegment = (segmentId) => {
  return {
    segmentId,
    type: 'REMOVE_SEGMENT'
  }
}

export default removeSegment
