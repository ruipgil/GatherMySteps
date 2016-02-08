import {min, max} from './util.js'
let nSegments = 0

export default function GPXToLayers(gpx) {
  // http://colorbrewer2.org/?type=qualitative&scheme=Set1&n=4
  var colors = ['#e41a1c','#377eb8','#4daf4a','#984ea3']
  var maxLat = -Infinity, maxLon = -Infinity, minLat = Infinity, minLon = Infinity;
  var groups = gpx.trk.map(function(track) {
    return track.trkseg.map(function(segment) {
      var color = colors[(nSegments++)%colors.length]
      var points = L.layerGroup()
      var line = L.polyline([], {
        color: color
      })
      var pointOptions = {
        color: color,
        fillOpacity: 1,
        stroke: false
      }
      segment.trkpt.forEach(function(point) {
        line.addLatLng([point.lat, point.lon])
        points.addLayer(L.circle([point.lat, point.lon], 8, pointOptions))
        maxLat = max(maxLat, point.lat)
        minLat = min(minLat, point.lat)

        maxLon = max(maxLon, point.lon)
        minLon = min(minLon, point.lon)
      })
      return L.layerGroup([line, points])
    })
  })

  return {
    layers: groups,
    bounds: [[minLat, minLon], [maxLat, maxLon]]
  }
}
