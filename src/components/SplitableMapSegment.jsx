import React from 'react'
import PointPolyline from './PointPolyline.jsx'
import { splitSegment } from '../actions/segments'

const SplitableMapSegment = (points, trackId, id, color, dispatch) => {
  return (
    <PointPolyline
      opacity={1.0}
      positions={points.slice(1, -1)}
      color={color}
      key={trackId + ' ' + id}
      onPointClick={(point, i) => {
        dispatch(splitSegment(id, i))
      }} />
  )
}

export default SplitableMapSegment
