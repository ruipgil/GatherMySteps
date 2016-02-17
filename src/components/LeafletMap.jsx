import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import EditablePolyline from './EditablePolyline.jsx'
import PointPolyline from './PointPolyline.jsx'
import { Polyline } from 'react-leaflet'
import { splitSegment } from '../actions'
import { changeSegmentPoint, removeSegmentPoint, addSegmentPoint, extendSegment, joinSegment } from '../actions'

import GoogleTileLayer from './GoogleTileLayer.jsx'

const LeafletMap = ({bounds, map, tracks, dispatch}) => {
  const elements = tracks.map((track, i) => {
    return track.map((segment) => {
      const points = segment.points
      const t = points.map((t) => { return {lat: t.lat, lon: t.lon} })

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
          dispatch(joinSegment(segment.id, i))
        }
      }

      return (<Elm opacity={1.0} positions={t} color={ segment.color } key={segment.id + ' ' + track.id} {...handlers} />)
    })
  })

  bounds = bounds || [{lat: 67.47492238478702, lng: 225}, {lat: -55.17886766328199, lng: -225}]

  let Layer
  switch (map) {
    case 'google':
      Layer = (<GoogleTileLayer detail='' />)
      break
    case 'google_road':
      Layer = (<GoogleTileLayer detail='ROADMAP' />)
      break
    default:
      Layer = (
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      )
  }

  return (
    <Map id='map' bounds={bounds} boundsOptions={{paddingTopLeft: [300, 0]}} >
      { Layer }
      { elements }
    </Map>
  )
}

export default LeafletMap
