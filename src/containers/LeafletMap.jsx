import React from 'react'
import { connect } from 'react-redux'
import { Map, TileLayer, Polyline, LayerGroup } from 'react-leaflet'
import EditablePolyline from '../components/EditablePolyline.jsx'
import PointPolyline from '../components/PointPolyline.jsx'
import GoogleTileLayer from '../components/GoogleTileLayer.jsx'

import {
  splitSegment,
  changeSegmentPoint,
  removeSegmentPoint,
  addSegmentPoint,
  extendSegment,
  joinSegment
} from '../actions/segments'

import {
  useOSMMaps,
  useGoogleSatelliteMaps,
  useGoogleRoadMaps,
  useGoogleHybridMaps,
  useGoogleTerrainMaps
} from '../actions/ui'

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

const SplitableMapSegment = (points, trackId, id, color, dispatch) => {
  return (
    <PointPolyline
      opacity={1.0}
      positions={points}
      color={color}
      key={trackId + ' ' + id}
      onPointClick={(point, i) => {
        dispatch(splitSegment(id, i))
      }} />
  )
}

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

const PointDetailMapSegment = (points, trackId, id, color, possibilies) => {
  return (
    <PointPolyline
      opacity={1.0}
      positions={points}
      color={color}
      key={trackId + ' ' + id}
      popupInfo={points} />
  )
}
const mapStates = {
  VANILLA: 0,
  EDITING: 1,
  SPLITING: 2,
  JOINING: 3,
  POINT_DETAILS: 4
}

const ComplexMapSegments = (points, id, color, trackId, state, joinPossible, dispatch) => {
  switch (state) {
    case mapStates.EDITING:
      return EditableMapSegment(points, trackId, id, color, dispatch)
    case mapStates.SPLITING:
      return SplitableMapSegment(points, trackId, id, color, dispatch)
    case mapStates.JOINING:
      return JoinableMapSegment(points, trackId, id, color, joinPossible, dispatch)
    case mapStates.POINT_DETAILS:
      return PointDetailMapSegment(points, trackId, id, color, trackId)
    default:
      return null
  }
}

const SelectMapSegment = (points, id, color, trackId, state, joinPossible, dispatch) => {
  return (
    <LayerGroup key={trackId + ' ' + id} >
      <Polyline opacity={1.0} positions={points} color={ color } />
      {ComplexMapSegments(points, id, color, trackId, state, joinPossible, dispatch)}
    </LayerGroup>
  )
}

const segmentStateSelector = (segment) => {
  if (segment.get('editing')) {
    return mapStates.EDITING
  } else if (segment.get('spliting')) {
    return mapStates.SPLITING
  } else if (segment.get('joining')) {
    return mapStates.JOINING
  } else if (segment.get('pointDetails')) {
    return mapStates.POINT_DETAILS
  } else {
    return mapStates.VANILLA
  }
}

const TileLayerSelector = (map) => {
  switch (map) {
    case 'google_sattelite':
      return (<GoogleTileLayer mapType='SATELLITE' />)
    case 'google_road':
      return (<GoogleTileLayer mapType='ROADMAP' />)
    case 'google_hybrid':
      return (<GoogleTileLayer mapType='HYBRID' />)
    case 'google_terrain':
      return (<GoogleTileLayer mapType='TERRAIN' />)
    default:
      return (
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      )
  }
}

let LeafletMap = ({bounds, map, segments, dispatch}) => {
  const elms = segments.filter((segment) => segment.get('display')).map((segment) => {
    const points = segment.get('points').toJS()
    const state = segmentStateSelector(segment)
    const color = segment.get('color')
    const id = segment.get('id')
    const trackId = segment.get('trackId')
    const joinPossible = segment.get('joinPossible')
    return SelectMapSegment(points, id, color, trackId, state, joinPossible, dispatch)
  }).toJS()
  const elements = Object.keys(elms).map((e) => elms[e])

  bounds = bounds || [{lat: 67.47492238478702, lng: 225}, {lat: -55.17886766328199, lng: -225}]

  return (
    <div className='fill' >
      <div id='controls'>
        <div className={'clickable' + (!map || map === 'osm' ? ' bold-text' : '')} onClick={() => dispatch(useOSMMaps())} >OpenStreetMaps</div>
        <div className={'clickable' + (map === 'google_sattelite' ? ' bold-text' : '')} onClick={() => dispatch(useGoogleSatelliteMaps())} >GoogleMaps Sattelite</div>
        <div className={'clickable' + (map === 'google_road' ? ' bold-text' : '')} onClick={() => dispatch(useGoogleRoadMaps())} >GoogleMaps Roads</div>
        <div className={'clickable' + (map === 'google_hybrid' ? ' bold-text' : '')} onClick={() => dispatch(useGoogleHybridMaps())} >GoogleMaps Hybrid</div>
        <div className={'clickable' + (map === 'google_terrain' ? ' bold-text' : '')} onClick={() => dispatch(useGoogleTerrainMaps())} >GoogleMaps Terrain</div>
      </div>
      <Map id='map' bounds={bounds} boundsOptions={{paddingTopLeft: [300, 0]}} >
        { TileLayerSelector(map) }
        { elements }
      </Map>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    map: state.get('ui').get('map'),
    bounds: state.get('ui').get('bounds'),
    segments: state.get('tracks').get('segments')
  }
}

LeafletMap = connect(mapStateToProps)(LeafletMap)

export default LeafletMap
