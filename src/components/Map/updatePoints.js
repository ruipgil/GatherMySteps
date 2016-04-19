import { createPointsFeatureGroup } from './utils'

export default (segment, points, color) => {
  /* const tfLower = (filter.get(0) || points.get(0).get('time')).valueOf()
     const tfUpper = (filter.get(-1) || points.get(-1).get('time')).valueOf()
     const timeFilter = (point) => {
     const t = point.get('time').valueOf()
     return tfLower <= t && t <= tfUpper
     }*/
  if (!segment.updated) {
    const pts = points.map((point) => ({lat: point.get('lat'), lon: point.get('lon')})).toJS()
    segment.polyline.setLatLngs(pts)
    // segment.layergroup.removeLayer(segment.points.length, segment.points)
    segment.layergroup.removeLayer(segment.points)
    segment.points = createPointsFeatureGroup(pts, color, segment.pointsEventMap)
    // segment.points.addTo(segment.layergroup)
  }
}
