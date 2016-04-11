import Leaflet, { FeatureGroup, Polyline, CircleMarker, Icon, Control } from 'leaflet'
import { Google } from 'leaflet-plugins/layer/tile/Google.js'
import React, { Component } from 'react'
import { Set } from 'immutable'
import { findDOMNode, render } from 'react-dom'
import {
  extendSegment,
  splitSegment,
  changeSegmentPoint,
  addSegmentPoint,
  removeSegmentPoint,
  joinSegment
} from 'actions/segments'
import { undo, redo } from 'actions/progress'
import { PolylineEditor } from 'leaflet-editable-polyline'

// TODO, update editable polyline when undo

const CIRCLE_OPTIONS = {
  opacity: 0.7,
  fillOpacity: 1
}

const createCircleOptions = (color) => Object.assign({}, CIRCLE_OPTIONS, { color })
const createPointsFeatureGroup = (pts, color, pointsEventMap = {}) => {
  const cpts = pts.map((point, i) => {
    const p = new CircleMarker(point, 10)
    p.index = i
    return p
  })
  const pointsLayer = new FeatureGroup(cpts)
  pointsLayer.setStyle(createCircleOptions(color))

  pointsLayer.on(pointsEventMap)
  return pointsLayer
}
const PointPopup = ({ lat, lon, time, distance, velocity, n }) => {
  return (
    <div>
      <div>#{n}</div>
      <div>Lat: <b>{lat}</b> Lon: <b>{lon}</b></div>
      <div>Time: <b>{time.toString()}</b></div>
      <div><b>{(distance * 1000).toFixed(3)}</b>m at <b>{velocity.toFixed(3)}</b>km/h</div>
    </div>
  )
}
const Button = Control.extend({
  options: [],

  onAdd: function (map) {
    const zoomName = 'leaflet-control-zoom'
    const container = Leaflet.DomUtil.create('div', zoomName + ' leaflet-bar')
    const options = this.options

    let opts
    if (Array.isArray(options)) {
      opts = options
    } else if (options['0']) {
      opts = Object.keys(options).sort().map((option) => options[option])
    } else {
      opts = [options]
    }

    opts.map((button) => {
      return this._createButton(button, zoomName + '-in', container)
    })

    return container
  },

  _createButton: function (button, className, container) {
    var link = Leaflet.DomUtil.create('a', className, container)
    if (typeof button.button === 'string') {
      link.innerHTML = button.button || ''
    } else {
      render(button.button || null, link)
    }
    link.href = '#'
    link.title = button.title || ''

    Leaflet.DomEvent
    .on(link, 'mousedown dblclick', Leaflet.DomEvent.stopPropagation)
    .on(link, 'click', Leaflet.DomEvent.stop)
    .on(link, 'click', button.onClick || function () {}, this)
    .on(link, 'click', this._refocusOnMap, this)

    return link
  }
})

export default class PerfMap extends Component {
  constructor (props) {
    super(props)
    this.map = undefined
    /**
     * Holds the segments currently displayed in their leaflet form
     *  keys: segment id
     *  values: object of
     *    { layergroup, polyline, points, pointsEventMap } layergroup contains polyline and points
     *      - pointsEventMap is an object { eventName: fn(target, i) }
     */
    this.segments = {}
  }

  componentDidMount () {
    const m = findDOMNode(this.refs.map)
    this.map = Leaflet.map(m, {
      // bounds: this.props.bounds
      zoomControl: false
    })
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    var osm = new Leaflet.TileLayer(osmUrl, {attribution: osmAttrib})
    var osm2 = new Leaflet.TileLayer(osmUrl, {attribution: osmAttrib})

    var zoomControl = new Control.Zoom({
      position: 'topright'
    })
    zoomControl.addTo(this.map)

    const ggl = new Google()

    var layersControl = new Control.Layers({
      'OpenStreetMaps': osm,
      'OpenStreetMaps2': osm2,
      'Google Maps: Terrain': new Google('google_terrain'),
      'Google Maps: Sattelite': ggl
    }, {})
    layersControl.addTo(this.map)

    const { dispatch } = this.props
    const btn = new Button([
      {
        button: (<i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-undo' />),
        title: 'undo',
        onClick: () => dispatch(undo())
      },
      {
        button: (<i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-repeat' />),
        title: 'redo',
        onClick: () => dispatch(redo())
      }
    ])
    btn.addTo(this.map)

    new Button({
      button: (<i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-map-marker' />),
      title: 'Position on your location'
    }).addTo(this.map)
    // start the map in South-East England
    // this.map.setView(new Leaflet.LatLng(51.3, 0.7), 9)
    this.map.fitWorld()
    this.map.addLayer(osm)
  }

  componentWillUnmount () {
    this.map.remove()
  }

  /**
   * Reveives the following props
   *    + center
   *    + bounds
   *    + segments : array of objects
   *        - points: array
   *        - color : bool
   *        - show  : bool
   *        - id    : string
   *        - diff  : fn (executes a function when there was a change, receives the leaflet map, and segment)
   *        - operation : [details, edit, split, join]
   *        - filter: fn (temporal or bounds)
   */
  componentDidUpdate (prev) {
    if (!this.map) {
      return
    }

    const { center, bounds, zoom, segments } = this.props

    this.shouldUpdateZoom(zoom, prev.zoom)
    this.shouldUpdateCenter(center, prev.center)
    this.shouldUpdateBounds(bounds, prev.bounds)
    this.shouldUpdateSegments(segments, prev.segments)
  }

  shouldUpdateZoom (current, previous) {
    if (current !== previous || this.map.getZoom() !== current) {
      this.map.setZoom(current)
    }
  }

  shouldUpdateCenter (current, previous) {
    let tCenter
    if (current) {
      tCenter = Leaflet.LatLng(current.lat, current.lon || current.lng)
    }
    if (current !== previous || (tCenter && !this.map.getCenter().equals(tCenter))) {
      this.map.setView(tCenter)
    }
  }

  shouldUpdateSegments (segments, previous) {
    if (segments !== previous) {
      segments.forEach((segment) => {
        this.shouldUpdateSegment(segment, previous.get(segment.get('id')))
      })

      this.shouldRemoveSegments(segments, previous)
    }
  }

  shouldUpdateSegment (current, previous) {
    if (current !== previous) {
      const points = current.get('points')
      const color = current.get('color')
      const display = current.get('display')
      const id = current.get('id')
      const filter = current.get('timeFilter')
      const lseg = this.segments[id]

      if (lseg) {
        this.shouldUpdatePoints(lseg, points, filter, previous, color)
        this.shouldUpdateColor(lseg, color, previous.get('color'))
        this.shouldUpdateDisplay(lseg, display, previous.get('display'))
        this.shouldUpdateMode(lseg, current, previous)
      } else {
        this.addSegment(id, points, color, display, filter)
      }
    }
  }

  shouldUpdateMode (lseg, current, previous) {
    if (lseg.tearDown) {
      lseg.tearDown(current)
    }
    if (current.get('spliting') !== previous.get('spliting')) {
      if (current.get('spliting')) {
        this.splitMode(lseg, current, previous)
      }
    }
    if (current.get('pointDetails') !== previous.get('pointDetails')) {
      if (current.get('pointDetails')) {
        this.detailMode(lseg, current, previous)
      }
    }
    if (current.get('editing') !== previous.get('editing')) {
      if (current.get('editing')) {
        this.editMode(lseg, current, previous)
      }
    }
    if (current.get('joining') !== previous.get('joining')) {
      if (current.get('joining')) {
        this.joinMode(lseg, current, previous)
      }
    }
  }

  joinMode (lseg, current, previous) {
    const { dispatch } = this.props
    const id = current.get('id')
    const possibilities = current.get('joinPossible')

    let handlers = {}
    let reset = () => {}
    possibilities.forEach((pp) => {
      if (pp.show === 'END') {
        handlers.showEnd = (point, i) => {
          reset()
          dispatch(joinSegment(id, i, pp))
        }
      }
      if (pp.show === 'START') {
        handlers.showStart = (point, i) => {
          reset()
          dispatch(joinSegment(id, i, pp))
        }
      }
    })

    const ls = lseg.points.getLayers()
    let arr = []
    if (handlers.showStart) {
      arr.push(new CircleMarker(ls[0].getLatLng(), { radius: 10 }).on('click', handlers.showStart))
    }
    if (handlers.showEnd) {
      arr.push(new CircleMarker(ls[ls.length - 1].getLatLng(), { radius: 10 }).on('click', handlers.showEnd))
    }
    const group = new FeatureGroup(arr)
    reset = () => {
      lseg.layergroup.removeLayer(group)
      lseg.tearDown = null
    }
    lseg.tearDown = reset

    group.addTo(lseg.layergroup)
  }

  splitMode (lseg, current, previous) {
    const { dispatch } = this.props
    lseg.points.on('click', (target) => {
      const index = target.layer.index
      const id = current.get('id')

      lseg.layergroup.removeLayer(lseg.points)
      dispatch(splitSegment(id, index))
    })
    lseg.tearDown = () => {
      lseg.layergroup.removeLayer(lseg.points)
      lseg.points.off('click')
      lseg.tearDown = null
    }
    lseg.points.addTo(lseg.layergroup)
  }

  detailMode (lseg, current, previous) {
    lseg.points.on('click', (target) => {
      const index = target.layer.index
      const point = current.get('points').get(index)
      const pm = current.get('metrics').get('points').get(index)

      const popup = <PointPopup lat={point.get('lat')} lon={point.get('lon')} time={point.get('time')} distance={pm.get('distance')} velocity={pm.get('velocity')} n={index} />
      const div = document.createElement('div')
      render(popup, div)
      target.layer.bindPopup(div).openPopup()
    })
    lseg.points.addTo(lseg.layergroup)
    lseg.tearDown = () => {
      lseg.points.off('click')
      lseg.layergroup.removeLayer(lseg.points)
      lseg.tearDown = null
    }
  }

  editMode (lseg, current, previous) {
    const { dispatch } = this.props
    const id = current.get('id')
    let options = {
      onChange: (n, points) => {
        let {lat, lng} = points[n]._latlng
        dispatch(changeSegmentPoint(id, n, lat, lng))
      },
      onRemove: (n, points) => {
        dispatch(removeSegmentPoint(id, n))
      },
      onPointAdd: (n, points) => {
        let {lat, lng} = points[n]._latlng
        dispatch(addSegmentPoint(id, n, lat, lng))
      },
      onExtend: (n, points) => {
        let {lat, lng} = points[n]._latlng
        dispatch(extendSegment(id, n, lat, lng))
      }
    }
    options.pointIcon = new Icon({
      iconUrl: '/pointIcon.svg',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
    options.newPointIcon = new Icon({
      iconUrl: '/newPointIcon.svg',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
    options.maxMarkers = 1000

    const editable = PolylineEditor(current.get('points').toJS(), options)
    editable.addTo(lseg.layergroup)

    lseg.tearDown = (segment) => {
      if (!segment.get('editing')) {
        lseg.layergroup.removeLayer(editable)
        lseg.tearDown = null
      }
    }
  }

  shouldUpdateBounds (bounds, prev) {
    let tBounds
    if (bounds) {
      tBounds = Leaflet.latLngBounds(bounds.toJS())
    }
    if (bounds !== prev) {
      this.map.fitBounds(tBounds)
    }
  }

  shouldUpdatePoints (segment, points, filter, prev, color) {
    if (points !== prev.get('points') || filter.get(0) !== prev.get('timeFilter').get(0) || filter.get(-1) !== prev.get('timeFilter').get(-1)) {
      const tfLower = filter.get(0) || points.get(0).get('time')
      const tfUpper = filter.get(-1) || points.get(-1).get('time')
      const timeFilter = (point) => point.get('time').isBetween(tfLower, tfUpper)
      const pts = points.filter(timeFilter).map((point) => ({lat: point.get('lat'), lon: point.get('lon')})).toJS()
      segment.polyline.setLatLngs(pts)
      segment.points = createPointsFeatureGroup(pts, color, segment.pointsEventMap)
    }
  }

  shouldUpdateColor (segment, color, prev) {
    if (color !== prev) {
      segment.setStyle({
        color
      })
    }
  }

  shouldUpdateDisplay (segment, display, prev) {
    if (display !== prev) {
      segment.setStyle({
        opacity: display ? 1 : 0
      })
    }
  }

  addSegment (id, points, color, display, filter) {
    const tfLower = filter.get(0) || points.get(0).get('time')
    const tfUpper = filter.get(-1) || points.get(-1).get('time')
    const timeFilter = (point) => point.get('time').isBetween(tfLower, tfUpper)
    const pts = points.filter(timeFilter).map((point) => ({lat: point.get('lat'), lon: point.get('lon')})).toJS()

    const pline = new Polyline(pts, {
      color,
      weight: 8,
      opacity: display ? 1 : 0
    })

    const pointsEventMap = {}
    const pointsLayer = createPointsFeatureGroup(pts, color, pointsEventMap)
    const layerGroup = new FeatureGroup([pline])

    // add segment
    const obj = {
      layergroup: layerGroup,
      polyline: pline,
      points: pointsLayer,
      pointsEventMap
    }
    this.segments[id] = obj
    layerGroup.addTo(this.map)
  }

  shouldRemoveSegments (segments, prev) {
    if (segments !== prev) {
      // delete segment if needed
      Set(prev.keySeq()).subtract(segments.keySeq()).forEach((s) => {
        this.map.removeLayer(this.segments[s].layergroup)
        this.segments[s] = null
      })
    }
  }

  render () {
    return (
      <div ref='map' style={{ height: '100%', zIndex: '1' }} ></div>
    )
  }
}
