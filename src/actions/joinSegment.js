const joinSegment = (segmentId, index, details) => {
  return {
    index,
    segmentId,
    details,
    type: 'JOIN_SEGMENT'
  }
}

export default joinSegment
