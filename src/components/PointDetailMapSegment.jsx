import React from 'react'
import PointPolyline from './PointPolyline.jsx'

const PointDetailMapSegment = (points, trackId, id, color, possibilies, details) => {
  return (
    <PointPolyline
      opacity={1.0}
      positions={points}
      color={color}
      key={trackId + ' ' + id}
      popupInfo={details.toJS()} />
  )
}

export default PointDetailMapSegment
