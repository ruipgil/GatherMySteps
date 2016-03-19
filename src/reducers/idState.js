let _trackId = 0
let _segmentId = 0

export const reset = () => {
  _trackId = 0
  _segmentId = 0
}

export const genTrackId = () => {
  return _trackId++
}

export const getTrackId = () => {
  return _trackId
}

export const genSegId = () => {
  return _segmentId++
}

export const getSegId = () => {
  return _segmentId
}
