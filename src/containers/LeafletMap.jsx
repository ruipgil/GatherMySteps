import React from 'react'
import { connect } from 'react-redux'
import { Map, TileLayer } from 'react-leaflet'
import EditablePolyline from '../components/EditablePolyline.jsx'
import PointPolyline from '../components/PointPolyline.jsx'
import { Polyline } from 'react-leaflet'
import splitSegment from '../actions/splitSegment'
import changeSegmentPoint from '../actions/changeSegmentPoint'
import removeSegmentPoint from '../actions/removeSegmentPoint'
import addSegmentPoint from '../actions/addSegmentPoint'
import extendSegment from '../actions/extendSegment'
import joinSegment from '../actions/joinSegment'

import { useOSMMaps, useGoogleMaps, useGoogleRoadMaps } from '../actions/changeMap'
import GoogleTileLayer from '../components/GoogleTileLayer.jsx'

let LeafletMap = ({bounds, map, tracks, dispatch}) => {
  const elements = tracks.map((track, i) => {
    return track.map((segment) => {
      const points = segment.points
      const t = points.map((t) => { return {lat: t.lat, lon: t.lon} })

      let Elm
      if (segment.editing) {
        Elm = EditablePolyline
      } else if (segment.spliting || segment.joining || segment.pointDetails) {
        Elm = PointPolyline
      } else {
        Elm = Polyline
      }
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
        let p = segment.joinPossible
        p.forEach((pp) => {
          if (pp.show === 'END') {
            handlers.showEnd = (point, i) => {
              dispatch(joinSegment(segment.id, i, pp))
            }
          }
          if (pp.show === 'START') {
            handlers.showStart = (point, i) => {
              dispatch(joinSegment(segment.id, i, pp))
            }
          }
        })
      } else if (segment.pointDetails) {
        handlers.popupInfo = points
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
    <div className='fill' >
      <div id='controls'>
        <div className='control-btn' onClick={() => dispatch(useOSMMaps())} >OSM</div>
        <div className='control-btn' onClick={() => dispatch(useGoogleMaps())} >GoogleMaps Terrain</div>
        <div className='control-btn' onClick={() => dispatch(useGoogleRoadMaps())} >GoogleMaps Roads</div>
      </div>
      <Map id='map' bounds={bounds} boundsOptions={{paddingTopLeft: [300, 0]}} >
        { Layer }
        { elements }
      </Map>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    map: state.ui.map,
    bounds: state.ui.bounds,
    tracks: state.tracks.map((track) => track.segments.filter((segment) => segment.display))
  }
}

LeafletMap = connect(mapStateToProps)(LeafletMap)

export default LeafletMap
