import React from 'react'
import { LayerGroup, Polyline, Circle } from 'react-leaflet'

let _id = 0
const PointPolyline = (props) => {
  const { radius, positions, map, onPointClick, onlyEnds } = props
  let clickHandler = onPointClick || function () {}
  let points = positions.map((point, i) => {
    return (
      <Circle center={point} radius={radius || 2} key={_id++} onClick={(e) => clickHandler(point, i, e)} />
    )
  })

  if (onlyEnds) {
    points = [points[0], points[points.length - 1]]
  }

  return (
    <LayerGroup map={map} >
      <Polyline {...props} />
      { points }
    </LayerGroup>
  )
}

export default PointPolyline
