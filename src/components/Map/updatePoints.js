import { createPointsFeatureGroup, createPointIcon } from './utils'
import { LatLng, Marker } from 'leaflet'

export default function updatePoint (segment, current, previous, color) {
  /*
   const tfLower = (filter.get(0) || points.get(0).get('time')).valueOf()
   const tfUpper = (filter.get(-1) || points.get(-1).get('time')).valueOf()
   const timeFilter = (point) => {
   const t = point.get('time').valueOf()
   return tfLower <= t && t <= tfUpper
   }
  */
  if (segment.polyline && segment.points) {
    const update = (polylinePoints, markers) => {
      current.forEach((point, i) => {
        const lat = point.get('lat')
        const lng = point.get('lon')
        polylinePoints[i].lat = lat
        polylinePoints[i].lng = lng

        markers[i].setLatLng([lat, lng])
        markers[i].index = i
      })

      return polylinePoints
    }

    let polylinePoints = segment.polyline.getLatLngs()
    let markers = segment.points
    if (current.count() < previous.count()) {
      // remove points
      const len = previous.count() - current.count()
      const markersLayers = markers.getLayers()
      const markersLen = markersLayers.length - 1
      polylinePoints.splice(-len)
      for (let i = 0; i < len; i++) {
        markers.removeLayer(markersLayers[markersLen - i])
      }
    } else if (current.count() > previous.count()) {
      // add points
      const len = current.count() - previous.count()
      const icon = createPointIcon(color)
      for (let i = 0; i < len; i++) {
        polylinePoints.push(new LatLng(0, 0))
        markers.addLayer(new Marker(new LatLng(0, 0), { icon, draggable: false }))
      }
    }
    segment.polyline.setLatLngs(update(polylinePoints, markers.getLayers()))
  } else {
    // initalization
    const pts = current.map((point) => ({lat: point.get('lat'), lon: point.get('lon')})).toJS()
    segment.polyline.setLatLngs(pts)
    segment.points = createPointsFeatureGroup(pts, color, segment.pointsEventMap)
  }
}
