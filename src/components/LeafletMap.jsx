import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import EditablePolyline from './EditablePolyline.jsx'
import PointPolyline from './PointPolyline.jsx'
import { Polyline } from 'react-leaflet'
import { splitSegment } from '../actions'
import { changeSegmentPoint, removeSegmentPoint, addSegmentPoint, extendSegment } from '../actions'

import GoogleTileLayer from './GoogleTileLayer.jsx'

const max = (a, b) => a >= b ? a : b
const min = (a, b) => a <= b ? a : b

const LeafletMap = ({map, tracks, dispatch}) => {
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

      const Elm = segment.editing ? EditablePolyline : ((segment.spliting || segment.joining) ? PointPolyline : Polyline)
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
      if (segment.spliting) {
        handlers.onPointClick = (point, i) => {
          dispatch(splitSegment(segment.id, i))
        }
      } else if (segment.joining) {
        handlers.onlyEnds = true
        handlers.onPointClick = (point, i) => {
          // dispatch(joinSegment(track.id, segment.id, i))
        }
      }

      return (<Elm opacity={1.0} positions={t} color={ segment.color } key={segment.id + ' ' + track.id} {...handlers} />)
    })
  })

  const ns = elements.reduce((prev, seg) => prev + seg.length, 0)
  if (ns === 0) {
    bounds = [{lat: 67.47492238478702, lng: 225}, {lat: -55.17886766328199, lng: -225}]
  }

  let Layer
  console.log(map)
  switch (map) {
    case 'google':
      console.log('g')
      Layer = (<GoogleTileLayer />)
      break
    case 'google_road':
      console.log('g+')
      Layer = (<GoogleTileLayer detail='ROADMAP' />)
      break
    default:
      console.log('o+')
      Layer = (
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      )
  }

  return (
    <Map id='map' bounds={bounds} >
      { Layer }
      { elements }
    </Map>
  )
}

export default LeafletMap
