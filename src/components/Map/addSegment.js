import React from 'react'
import store from 'store'
import SegmentToolbox from 'components/SegmentToolbox'
import { Polyline, FeatureGroup, DivIcon, Marker } from 'leaflet'
import { createPointsFeatureGroup, renderToDiv } from './utils'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'

const LABEL_TO_ICON = {
  'Stop': 'fa-hand-grab-o',
  'Foot': 'fa-blind',
  'Vehicle': 'fa-car'
}

const angleBetween = (a, b) => {
  return Math.tanh((a.lat - b.lat) / (a.lon - b.lon)) * -1
}

const buildVerticalMarker = (start, next, previous, label) => {
  let angle = 0
  if (next) {
    angle = angleBetween(start, next)
  } else if (previous) {
    angle = angleBetween(previous, start)
  }

  const m = (
    <div style={{ transform: 'rotate(' + angle + 'rad)' }}>
      <div style={{ width: '2px', height: '14px', backgroundColor: 'black' }}></div>
      <div className={ 'fa ' + LABEL_TO_ICON[label] } style={{ position: 'relative', top: '5px', left: '-6px', color: 'black', fontSize: '12px' }}></div>
    </div>
  )

  return new Marker(start, { icon: new DivIcon({ className: '', html: renderToString(m) }) })
}

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

  const transModes = currentSegment.get('transportationModes')
  let tModes = []
  let lastTo
  if (transModes && transModes.count() > 0) {
    // debugger
    tModes = transModes.map((mode) => {
      const from = mode.get('from')
      const to = mode.get('to')
      const label = mode.get('label')

      lastTo = to
      return buildVerticalMarker(pts[from], pts[from + 1], pts[from - 1], label)
    }).toJS()
    tModes.push(buildVerticalMarker(pts[lastTo], null, pts[lastTo - 1]))
  }

  const pointsEventMap = {}
  const pointsLayer = createPointsFeatureGroup(pts, color, pointsEventMap)
  const layergroup = new FeatureGroup([pline])

  // add segment
  const obj = {
    layergroup,
    polyline: pline,
    points: pointsLayer,
    details: new FeatureGroup(),
    transportation: new FeatureGroup(tModes)
  }

  return obj
}
