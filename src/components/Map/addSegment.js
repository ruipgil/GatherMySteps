import React from 'react'
import store from 'store'
import SegmentToolbox from 'components/SegmentToolbox'
import { Polyline, FeatureGroup, DivIcon, Marker } from 'leaflet'
import { createPointsFeatureGroup, renderToDiv } from './utils'
import { Provider } from 'react-redux'
import buildTransportationModeRepresentation from './buildTransportationModeRepresentation'

export default (id, points, color, display, filter, segment, dispatch, previousPoints, currentSegment) => {
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
    const popup = renderToDiv(
      <Provider store={store}>
        <SegmentToolbox segment={segment} dispatch={dispatch} />
      </Provider>
    )
    e.target.bindPopup(popup, { autoPan: false }).openPopup()
  })

  const pointsEventMap = {}
  const pointsLayer = createPointsFeatureGroup(pts, color, pointsEventMap)
  const layergroup = new FeatureGroup([pline])

  // add segment
  const obj = {
    layergroup,
    polyline: pline,
    points: pointsLayer,
    details: new FeatureGroup(),
    transportation: buildTransportationModeRepresentation(obj, currentSegment)
  }

  return obj
}
