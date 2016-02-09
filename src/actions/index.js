export const COLORS = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']
let _id = 0
export const addTrack = (track, file) => {
  let id = _id++
  return {
    type: 'ADD_TRACK',
    track: {
      id,
      points: track,
      display: true,
      start: track[0][0].time[0],
      end: track[0][track[0].length-1].time[0],
      color: COLORS[id%COLORS.length],
      name: file.name
    }
  }
}

export const toggleTrackDisplay = (trackId, value) => {
  return {
    type: 'TOGGLE_TRACK_DISPLAY',
    trackId
  }
}

