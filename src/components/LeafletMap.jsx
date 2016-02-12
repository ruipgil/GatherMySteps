import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import EditablePolyline from './EditablePolyline.jsx'
import { Polyline } from 'react-leaflet'
import { changeSegmentPoint, removeSegmentPoint, addSegmentPoint, extendSegment } from '../actions'

const max = (a, b) => a >= b ? a : b
const min = (a, b) => a <= b ? a : b

const LeafletMap = ({tracks, dispatch}) => {
  var bounds = [{lat: Infinity, lon: Infinity}, {lat: -Infinity, lon: -Infinity}]

  const elements = tracks.map((track, i) => {
    return track.map((segment) => {
      const points = segment.points
      const t = points.map((t) => { return {lat: t.lat, lon: t.lon} })
      t.forEach((elm) => {
        bounds[0].lat = min(bounds[0].lat, elm.lat)
        bounds[0].lon = min(bounds[0].lon, elm.lon)
        bounds[1].lat = max(bounds[1].lat, elm.lat)
        bounds[1].lon = max(bounds[1].lon, elm.lon)
      })

      const Elm = segment.editing ? EditablePolyline : Polyline
      const handlers = segment.editing ? {
        onChange: (n, points) => {
          let {lat, lng} = points[n]._latlng
          dispatch(changeSegmentPoint(segment.id, n, lat, lng))
        },
        onRemove: (n, points) => {
          dispatch(removeSegmentPoint(segment.id, n))
        },
        onPointAdd: (n, points) => {
          let {lat, lng} = points[n]._latlng
          dispatch(addSegmentPoint(segment.id, n, lat, lng))
        },
        onExtend: (n, points) => {
          let {lat, lng} = points[n]._latlng
          dispatch(extendSegment(segment.id, n, lat, lng))
        }
      } : {}
      return (<Elm opacity={1.0} positions={t} color={ segment.color } key={i} {...handlers} />)
    })
  })

  if (elements.length === 0) {
    bounds = undefined
  }

  return (
    <Map id='map' center={[13, 0]} zoom={2} bounds={bounds}>
      <TileLayer
        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      { elements }
    </Map>
  )
}

export default LeafletMap
