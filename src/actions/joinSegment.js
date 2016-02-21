const joinSegment = (segmentId, index) => {
  return {
    index,
    segmentId,
    type: 'JOIN_SEGMENT'
  }
}

export default joinSegment
