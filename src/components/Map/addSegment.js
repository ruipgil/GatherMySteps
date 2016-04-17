import { Polyline, FeatureGroup } from 'leaflet'
import { createPointsFeatureGroup, renderToDiv } from './utils'

export default (id, points, color, display, filter, segment, dispatch) => {
  const tfLower = (filter.get(0) || points.get(0).get('time')).valueOf()
  const tfUpper = (filter.get(-1) || points.get(-1).get('time')).valueOf()
  const timeFilter = (point) => {
    const t = point.get('time')
    return tfLower <= t && t <= tfUpper
  }
  const pts = points.filter(timeFilter).map((point) => ({lat: point.get('lat'), lon: point.get('lon')})).toJS()

  const pline = new Polyline(pts, {
    color,
    weight: 8,
    opacity: display ? 1 : 0
  }).on('click', (e) => {
    const popup = renderToDiv(<SegmentToolbox segment={segment} dispatch={dispatch} />)
    e.target.bindPopup(popup).openPopup()
  })

  const pointsEventMap = {}
  const pointsLayer = createPointsFeatureGroup(pts, color, pointsEventMap)
  const layerGroup = new FeatureGroup([pline])

  // add segment
  const obj = {
    layergroup: layerGroup,
    polyline: pline,
    points: pointsLayer,
    pointsEventMap
  }

  return obj
}
