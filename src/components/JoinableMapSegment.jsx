import React from 'react'
import PointPolyline from './PointPolyline.jsx'
import { joinSegment } from '../actions/segments'

const JoinableMapSegment = (points, trackId, id, color, possibilities, dispatch) => {
  let handlers = {}
  possibilities.forEach((pp) => {
    if (pp.show === 'END') {
      handlers.showEnd = (point, i) => {
        dispatch(joinSegment(id, i, pp))
      }
    }
    if (pp.show === 'START') {
      handlers.showStart = (point, i) => {
        dispatch(joinSegment(id, i, pp))
      }
    }
  })
  return (
    <PointPolyline
      opacity={1.0}
      positions={points}
      color={color}
      key={trackId + ' ' + id}
      {...handlers} />
  )
}

export default JoinableMapSegment
