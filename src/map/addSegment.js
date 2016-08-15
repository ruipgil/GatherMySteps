import React from 'react'
import store from 'store'
import SegmentToolbox from 'components/SegmentToolbox'
import { Polyline, FeatureGroup, DivIcon, Marker } from 'leaflet'
import { createPointsFeatureGroup, renderToDiv, createPointIcon, createMarker } from './utils'
import { Provider } from 'react-redux'
import buildTransportationModeRepresentation from './buildTransportationModeRepresentation'

export default (id, points, color, display, filter, segment, dispatch, previousPoints, currentSegment) => {
  let pts
  if (points.get(0).get('time')) {
    const tfLower = (filter.get(0) || points.get(0).get('time')).valueOf()
    const tfUpper = (filter.get(-1) || points.get(-1).get('time')).valueOf()
    const timeFilter = (point) => {
      const t = point.get('time')
      return tfLower <= t && t <= tfUpper
    }
    pts = points.filter(timeFilter).map((point) => ({lat: point.get('lat'), lon: point.get('lon')})).toJS()
  } else {
    pts = points.map((point) => ({lat: point.get('lat'), lon: point.get('lon')})).toJS()
  }
  console.log(pts)

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
  const specialMarkers = {
    start: createMarker(pts[0], createPointIcon(color, '<i class="p-fa fa-play" />')),
    end: createMarker(pts[pts.length - 1], createPointIcon(color, '<i class="p-fa fa-stop" />'))
  }
  const layergroup = new FeatureGroup([pline, ...Object.keys(specialMarkers).map((k) => specialMarkers[k])])

  // add segment
  const obj = {
    layergroup,
    specialMarkers,
    polyline: pline,
    points: pointsLayer,
    details: new FeatureGroup(),
    transportation: buildTransportationModeRepresentation(obj, currentSegment)
  }

  return obj
}
