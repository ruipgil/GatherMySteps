import {
  ADD_TRACK,
  TOGGLE_TRACK_RENAMING,
  UPDATE_TRACK_NAME
} from './'

export const addTrack = (segments, name) => {
  return {
    segments,
    name,
    type: ADD_TRACK
  }
}

export const toggleTrackRenaming = (trackId) => {
  return {
    trackId,
    type: TOGGLE_TRACK_RENAMING
  }
}

export const updateTrackName = (trackId, newName) => {
  return {
    trackId,
    name: newName,
    type: UPDATE_TRACK_NAME
  }
}

const exportGPX = (track) => {
  return track.segments.reduce((prev, s) => {
    return prev + s.points.reduce((prev, p) => {
      return prev + '<trkpt lat="' + p.lat + '" lon="' + p.lon + '">' +
      '<time>' + p.time.toISOString() + '</time>' +
      '</trkpt>'
    }, '<trkseg>') + '</trkseg>'
  }, '<?xml version="1.0" encoding="UTF-8"?><gpx xmlns="http://www.topografix.com/GPX/1/1"><trk>') + '</trk></gpx>'
}

import saveData from './saveData'
export const downloadTrack = (track) => {
  let str = exportGPX(track)
  saveData(str, track.name)
  return str
}
