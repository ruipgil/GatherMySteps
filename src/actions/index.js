export const COLORS = [
  '#a6cee3', '#1f78b4', '#b2df8a',
  '#33a02c', '#fb9a99', '#e31a1c',
  '#fdbf6f', '#ff7f00', '#cab2d6',
  '#6a3d9a', '#ffff99', '#b15928'
]
let _trackId = 0
let _segmentId = 0
export const addTrack = (track, file) => {
  let id = _trackId++
  return {
    type: 'ADD_TRACK',
    track: {
      id,
      segments: track.map((segment) => {
        let sId = _segmentId++
        return {
          id: sId,
          points: segment,
          display: true,
          start: segment[0].time,
          end: segment[segment.length - 1].time,
          color: COLORS[sId % COLORS.length],
          name: ''
        }
      }),
      name: file.name
    }
  }
}

export const toggleSegmentDisplay = (segmentId, value) => {
  return {
    segmentId,
    type: 'TOGGLE_SEGMENT_DISPLAY'
  }
}
