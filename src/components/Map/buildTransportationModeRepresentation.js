import React from 'react'
import { FeatureGroup, Marker, DivIcon } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { createPointIcon, createMarker } from './utils'

const LABEL_TO_ICON = {
  'Stop': (color) => createPointIcon(color, '<i class="p-fa fa-hand-grab-o" />'),
  'Foot': (color) => createPointIcon(color, '<i class="p-fa fa-blind" />'),
  'Vehicle': (color) => createPointIcon(color, '<i class="p-fa fa-car" />'),
  '?': (color) => createPointIcon(color, '<i class="p-fa fa-question" />')
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

export default (lseg, segment) => {
  const transModes = segment.get('transportationModes')
  let tModes = []
  let lastTo
  const pts = segment.get('points').toJS()
  if (transModes && transModes.count() > 0) {
    // debugger
    tModes = transModes.map((mode) => {
      const from = mode.get('from')
      const to = mode.get('to')
      const label = mode.get('label')

      lastTo = to
      // return buildVerticalMarker(pts[from], pts[from + 1], pts[from - 1], label)
      let iconCreater = LABEL_TO_ICON[label] || LABEL_TO_ICON['?']
      return createMarker(pts[from], iconCreater(segment.get('color')))
    }).toJS()
    // tModes.push(buildVerticalMarker(pts[lastTo], null, pts[lastTo - 1]))
  }

  return new FeatureGroup(tModes)
}
