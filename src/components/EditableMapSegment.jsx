import React from 'react'
import EditablePolyline from './EditablePolyline.jsx'
import {
  changeSegmentPoint,
  removeSegmentPoint,
  addSegmentPoint,
  extendSegment
} from '../actions/segments'

const EditableMapSegment = (points, trackId, id, color, dispatch) => {
  return (
    <EditablePolyline
      opacity={1.0}
      positions={points}
      color={color}
      key={trackId + ' ' + id + 'e'}
      onChange={(n, points) => {
        let {lat, lng} = points[n]._latlng
        dispatch(changeSegmentPoint(id, n, lat, lng))
      }}
      onRemove={(n, points) => {
        dispatch(removeSegmentPoint(id, n))
      }}
      onPointAdd={(n, points) => {
        let {lat, lng} = points[n]._latlng
        dispatch(addSegmentPoint(id, n, lat, lng))
      }}
      onExtend={(n, points) => {
        let {lat, lng} = points[n]._latlng
        dispatch(extendSegment(id, n, lat, lng))
      }} />
  )
}

export default EditableMapSegment
