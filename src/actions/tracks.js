export const addTrack = (segments, name) => {
  return {
    segments,
    name,
    type: 'ADD_TRACK'
  }
}

export const toggleTrackRenaming = (trackId) => {
  return {
    trackId,
    type: 'TOGGLE_TRACK_RENAMING'
  }
}

export const updateTrackName = (trackId, newName) => {
  return {
    trackId,
    name: newName,
    type: 'UPDATE_TRACK_NAME'
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

var saveData = (function () {
  let a = document.createElement('a')
  document.body.appendChild(a)
  a.style = 'display: none'
  return function (data, fileName) {
    let blob = new Blob([data], {type: 'octet/stream'})
    let url = window.URL.createObjectURL(blob)
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
  }
}())

export const downloadTrack = (track) => {
  let str = exportGPX(track)
  saveData(str, track.name)
  return str
}
