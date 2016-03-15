import React from 'react'
import { connect } from 'react-redux'
import { Map, ScaleControl, ZoomControl, TileLayer, Polyline, LayerGroup } from 'react-leaflet'
import EditablePolyline from '../components/EditablePolyline.jsx'
import PointPolyline from '../components/PointPolyline.jsx'
import GoogleTileLayer from '../components/GoogleTileLayer.jsx'
import { ButtonFoldableGroup, Button, ButtonGroup } from '../components/MapButton.jsx'

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
  useGoogleTerrainMaps,
  showDetails,
  hideDetails,
  updateBounds
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
      positions={points.slice(1, -1)}
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
const mapStates = {
  VANILLA: 0,
  EDITING: 1,
  SPLITING: 2,
  JOINING: 3,
  POINT_DETAILS: 4
}

const ComplexMapSegments = (points, id, color, trackId, state, joinPossible, metrics, dispatch) => {
  switch (state) {
    case mapStates.EDITING:
      return EditableMapSegment(points, trackId, id, color, dispatch)
    case mapStates.SPLITING:
      return SplitableMapSegment(points, trackId, id, color, dispatch)
    case mapStates.JOINING:
      return JoinableMapSegment(points, trackId, id, color, joinPossible, dispatch)
    case mapStates.POINT_DETAILS:
      return PointDetailMapSegment(points, trackId, id, color, trackId, metrics.get('points'))
    default:
      return null
  }
}

const SelectMapSegment = (points, id, color, trackId, state, joinPossible, metrics, details, dispatch) => {
  const complex = details ? ComplexMapSegments(points, id, color, trackId, state, joinPossible, metrics, dispatch) : null
  return (
    <LayerGroup key={trackId + ' ' + id} >
      <Polyline opacity={1.0} positions={points} color={ color } />
      {complex}
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

const between = (a, b, c) => {
  return a <= b && b <= c
}
/*
const boundsFilter = (ne, sw) => {
  console.log(ne, sw)
  return (point) => {
    const lat = point.get('lat')
    const lon = point.get('lon')
    return between(sw.lat, lat, ne.lat) &&
      between(sw.lng, lon, ne.lng)
  }
}
*/
  const boundsFilter = (ne, sw) => {
    return (point) => {
    const lat = point.get('lat')
    const lon = point.get('lon')
      return ne.lat >= lat && lat >= sw.lat &&
        ne.lng >= lon && lon >= sw.lng
    }
  }

let LeafletMap = ({bounds, map, segments, details, dispatch}) => {
  let useMaxZoom = false
  let gBounds

  bounds = bounds || [{lat: 67.47492238478702, lng: 225}, {lat: -55.17886766328199, lng: -225}]

  const elms = segments.filter((segment) => segment.get('display')).map((segment) => {
    const sBounds = segment.get('bounds').toJS()
    const filter = boundsFilter(bounds[0], bounds[1])

    const inclusive = true
    const pts = segment.get('points')
    const points = inclusive ? pts.toJS() : pts.filter(filter).toJS()

    const state = segmentStateSelector(segment)
    const color = segment.get('color')
    const id = segment.get('id')
    const trackId = segment.get('trackId')
    const joinPossible = segment.get('joinPossible')
    const metrics = segment.get('metrics')
    if (state !== mapStates.VANILLA) {
      useMaxZoom = true
      const p = points[(points.length - 1) / 2]
      gBounds = {
        lat: p.lat,
        lon: p.lon
      }
    }
    return SelectMapSegment(points, id, color, trackId, state, joinPossible, metrics, details, dispatch)
  }).toJS()
  const elements = Object.keys(elms).map((e) => elms[e])

  const onZoom = (e) => {
    const zoom = e.target.getZoom()
    const maxZoom = e.target.getMaxZoom()
    if (zoom >= maxZoom && !details) {
      dispatch(showDetails())
    } else if (details) {
      dispatch(hideDetails())
    }
  }

  const btnStyle = { minWidth: 'auto', width: 'auto', fontSize: '0.8rem', textAlign: 'left' }
  const selectedStyle = (is) => {
    return Object.assign({}, btnStyle, is ? {textWeight: 'bold'} : {})
  }

  const chOSM = () => dispatch(useOSMMaps())
  const chGSat = () => dispatch(useGoogleSatelliteMaps())
  const chGRoads = () => dispatch(useGoogleRoadMaps())
  const chGHybrid = () => dispatch(useGoogleHybridMaps())
  const chGTerrain = () => dispatch(useGoogleTerrainMaps())
  /*
  const controls = (
    <ButtonFoldableGroup style={{ minWidth: '26px', width: 'auto' }}>
      <Button>
        <FA name='globe' />
      </Button>
      <Button style={selectedStyle(!map || map === 'osm')} onClick={chOSM}>OpenStreetMaps</Button>
      <Button style={selectedStyle(map === 'google_sattelite')} onClick={chGSat}>GoogleMaps Sattelite</Button>
      <Button style={selectedStyle(map === 'google_road')} onClick={chGRoads}>GoogleMaps Roads</Button>
      <Button style={selectedStyle(map === 'google_hybrid')} onClick={chGHybrid}>GoogleMaps Hybrid</Button>
      <Button style={selectedStyle(map === 'google_terrain')} onClick={chGTerrain}>GoogleMaps Terrain</Button>
    </ButtonFoldableGroup>
  )
  */
  let _justRendered = true

  let _m = null
  const onMove = (e) => {
    const bnds = e.target.getBounds()
    const bndObj = [
      {
        lat: bnds._northEast.lat,
        lng: bnds._northEast.lng
      }, {
        lat: bnds._southWest.lat,
        lng: bnds._southWest.lng
      }
    ]

    if (_justRendered || (bounds[0].lat === bndObj[0].lat && bounds[0].lng === bndObj[0].lng && bounds[1].lat === bndObj[1].lat && bounds[1].lng === bndObj[1].lng)) {
      _justRendered = false
      return
    }
    _m = updateBounds(bndObj)
    setTimeout(() => {
      if (_m) {
        const m = _m
        _m = null
        dispatch(m)
      }
    }, 100)
  }

  return (
    <div className='fill' >
      <Map id='map' bounds={bounds} onMoveEnd={onMove} onZoomEnd={onZoom} zoom={ useMaxZoom ? 18 : undefined } zoomControl={false}>
        <ZoomControl position='topright' />
        <ScaleControl position='bottomright' />
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
    segments: state.get('tracks').get('segments'),
    details: state.get('ui').get('details')
  }
}

LeafletMap = connect(mapStateToProps)(LeafletMap)

export default LeafletMap
