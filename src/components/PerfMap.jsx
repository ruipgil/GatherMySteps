import Leaflet, { Marker, FeatureGroup, Polyline, CircleMarker, DivIcon, Control } from 'leaflet'
// import { Google } from 'leaflet-plugins/layer/tile/Google.js'
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
  opacity: 1,
  radius: 10,
  fillColor: 'white',
  fillOpacity: 1
}

const createCircleOptions = (color) => Object.assign({}, CIRCLE_OPTIONS, { color })
const createPointsFeatureGroup = (pts, color, pointsEventMap = {}) => {
  const cpts = pts.map((point, i) => {
    const p = new CircleMarker(point)
    p.index = i
    return p
  })
  const pointsLayer = new FeatureGroup(cpts)
  pointsLayer.setStyle(createCircleOptions(color))

  pointsLayer.on(pointsEventMap)
  return pointsLayer
}
const PointPopup = ({ lat, lon, time, distance, velocity, i, onMove, count }) => {
  const flexAlignStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 10px'
  }
  const displayPrev = i !== 0
  const displayNext = (i + 1) < count
  return (
    <div className='is-flex'>
      <span style={Object.assign({}, flexAlignStyle, { opacity: displayPrev ? 1 : 0.5 })} onClick={() => (displayPrev ? onMove(i - 1) : null)} className='clickable'><i className='fa fa-chevron-left' /></span>
      <span>
        <div>#<strong>{i + 1}</strong></div>
        <div>Lat: <strong>{lat}</strong> Lon: <strong>{lon}</strong></div>
        <div>Time: <strong>{time.format('dddd, MMMM Do YYYY, HH:mm:ss')}</strong></div>
        <div><strong>{(distance * 1000).toFixed(3)}</strong>m at <strong>{velocity.toFixed(3)}</strong>km/h</div>
      </span>
      <span style={Object.assign({}, flexAlignStyle, { opacity: displayNext ? 1 : 0.5 })} onClick={() => (displayNext ? onMove(i + 1) : null)} className='clickable'><i className='fa fa-chevron-right' /></span>
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

    var zoomControl = new Control.Zoom({
      position: 'topright'
    })
    zoomControl.addTo(this.map)

    /* const ggl = new Google()
    var layersControl = new Control.Layers({
      'OpenStreetMaps': osm,
      'OpenStreetMaps2': osm2,
      'Google Maps: Terrain': new Google('google_terrain'),
      'Google Maps: Sattelite': ggl
    }, {})
    layersControl.addTo(this.map)*/

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
      title: 'Position on your location',
      onClick: () => this.map.locate({setView: true})
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
      lseg.tearDown(current, previous)
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
    if (current.get('editing') !== previous.get('editing') || (current.get('editing') && current.get('points') !== previous.get('points'))) {
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
    const id = current.get('id')
    lseg.points.on('click', (target) => {
      const index = target.layer.index

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

      const openPopupFor = (target, index) => {
        const point = current.get('points').get(index)
        const pm = current.get('metrics').get('points').get(index)
        const count = current.get('points').count()
        const next = (i) => {
          target.closePopup()
          target = lseg.points.getLayers()[i]
          openPopupFor(target, i)
        }
        const popup = (
          <PointPopup
            lat={point.get('lat')}
            lon={point.get('lon')}
            time={point.get('time')}
            distance={pm.get('distance')}
            velocity={pm.get('velocity')}
            i={index}
            count={count}
            onMove={next} />
        )
        const div = document.createElement('div')
        render(popup, div)
        target.bindPopup(div).openPopup()
      }

      openPopupFor(target.layer, index)
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
    const color = current.get('color')
    const points = current.get('points')
    const pointIcon = new DivIcon({
      className: 'fa editable-point border-color-' + color.substr(1),
      iconAnchor: [12, 12]
    })
    const newPointIcon = new DivIcon({
      className: 'fa fa-plus editable-point new-editable-point',
      iconAnchor: [12, 12]
    })

    const pointInBetween = (prev, after) => {
      const latDiff = after.get('lat') - prev.get('lat')
      const lonDiff = after.get('lon') - prev.get('lon')

      return [prev.get('lat') + latDiff / 2, prev.get('lon') + lonDiff / 2]
    }
    let group

    const createMarker = (point, icon) => new Marker(point, { icon, draggable: true })
    const removePoint = (e) => {
      const {lat, lng} = e.target.getLatLng()
      dispatch(removeSegmentPoint(id, e.target.index, lat, lng))
      lseg.layergroup.removeLayer(group)
    }
    const handler = (e) => {
      const { target } = e
      const { type, index } = target
      const {lat, lng} = target.getLatLng()
      if (type === 'NEW') {
        dispatch(addSegmentPoint(id, index, lat, lng))
        lseg.layergroup.removeLayer(group)
      } else if (type === 'MOVE') {
        dispatch(changeSegmentPoint(id, index, lat, lng))
        lseg.layergroup.removeLayer(group)
      } else if (type === 'EXTEND') {
        dispatch(extendSegment(id, index, lat, lng))
        lseg.layergroup.removeLayer(group)
      }
    }
    let helperLine
    const visualHelper = (e) => {
      const { previous, next } = e.target
      const points = lseg.points.getLayers()

      const latlngs = [
        previous < 0 ? null : points[previous].getLatLng(),
        e.target.getLatLng(),
        next >= points.length ? null : points[next].getLatLng()
      ]

      if (e.target.helperLine) {
        if (e.type === 'move') {
          e.target.helperLine.setLatLngs(latlngs.filter((x) => x))
        }
      } else {
        if (e.type === 'movestart') {
          helperLine = new Polyline(latlngs.filter((x) => x), { color: current.get('color'), opacity: 0.8 })
          helperLine.addTo(group)
        } else if (e.type === 'move') {
          helperLine.setLatLngs(latlngs.filter((x) => x))
        } else if (e.type === 'moveend') {
          group.removeLayer(helperLine)
        }
      }
    }

    let overlay = []
    let prevPoint
    points.forEach((point, i) => {
      if (prevPoint) {
        const nm = createMarker(pointInBetween(prevPoint, point), newPointIcon)
        nm.on('moveend click', handler)
        nm.on('move movestart moveend', visualHelper)
        nm.type = 'NEW'
        nm.index = i
        nm.previous = i - 1
        nm.next = i
        overlay.push(nm)
      }
      const existingPoint = createMarker([point.get('lat'), point.get('lon')], pointIcon)
      existingPoint.type = 'MOVE'
      existingPoint.index = i
      existingPoint.previous = i - 1
      existingPoint.next = i + 1
      existingPoint.on('moveend', handler)
      existingPoint.on('contextmenu', removePoint)
      existingPoint.on('move movestart moveend', visualHelper)
      overlay.push(existingPoint)
      prevPoint = point
    })

    // extend polyline at start
    const interpolated = [points.get(0).get('lat') - (points.get(1).get('lat') - points.get(0).get('lat')), points.get(0).get('lon') - (points.get(1).get('lon') - points.get(0).get('lon'))]
    const interpolated2 = [points.get(-1).get('lat') - (points.get(-2).get('lat') - points.get(-1).get('lat')), points.get(-1).get('lon') - (points.get(-2).get('lon') - points.get(-1).get('lon'))]
    const extendStart = createMarker(interpolated, newPointIcon)
    extendStart.on('moveend click', handler)
    extendStart.on('move movestart moveend', visualHelper)
    extendStart.type = 'EXTEND'
    extendStart.index = 0
    extendStart.previous = -1
    extendStart.next = 0
    overlay.push(extendStart)
    const extendStartGuide = new Polyline([ lseg.points.getLayers()[0].getLatLng(), interpolated ], { color: current.get('color'), dashArray: '5, 5' })
    overlay.push(extendStartGuide)
    extendStart.helperLine = extendStartGuide

    const extendEnd = createMarker(interpolated2, newPointIcon)
    extendEnd.on('moveend click', handler)
    extendEnd.on('move movestart moveend', visualHelper)
    extendEnd.type = 'EXTEND'
    extendEnd.index = points.count()
    extendEnd.previous = points.count() - 1
    extendEnd.next = points.count() - 1
    overlay.push(extendEnd)
    const extendEndGuide = new Polyline([ lseg.points.getLayers()[lseg.points.getLayers().length - 1].getLatLng(), interpolated2 ], { color: current.get('color'), dashArray: '5, 5' })
    overlay.push(extendEndGuide)
    extendEnd.helperLine = extendEndGuide

    group = new FeatureGroup(overlay)
    group.addTo(lseg.layergroup)

    lseg.tearDown = (current, previous) => {
      if (!current.get('editing') || (current.get('editing') && current.get('points') !== previous.get('points'))) {
        lseg.layergroup.removeLayer(group)
        lseg.tearDown = null
      }
    }

    /*
     * let options = {
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
      },
      pointIcon,
      newPointIcon
    }
    options.maxMarkers = 500
    options.weight = 0
    const opts = createCircleOptions(color)
    Object.keys(opts).forEach((option) => (options[option] = opts[option]))

    const editable = PolylineEditor(current.get('points').toJS(), options)
    editable.addTo(lseg.layergroup)

    lseg.tearDown = (current, prev) => {
      if (!current.get('editing')) {
        lseg.layergroup.removeLayer(editable)
        lseg.tearDown = null
      }
      }*/
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
      const tfLower = (filter.get(0) || points.get(0).get('time')).valueOf()
      const tfUpper = (filter.get(-1) || points.get(-1).get('time')).valueOf()
      const timeFilter = (point) => {
        const t = point.get('time').valueOf()
        return tfLower <= t && t <= tfUpper
      }
      const pts = points.map((point) => ({lat: point.get('lat'), lon: point.get('lon')})).toJS()
      segment.polyline.setLatLngs(pts)
      segment.layergroup.removeLayer(segment.points.length, segment.points)
      segment.points = createPointsFeatureGroup(pts, color, segment.pointsEventMap)
      // segment.points.addTo(segment.layergroup)
    }
  }

  shouldUpdateColor (segment, color, prev) {
    if (color !== prev) {
      segment.layergroup.setStyle({
        color
      })
    }
  }

  shouldUpdateDisplay (segment, display, prev) {
    if (display !== prev) {
      segment.layergroup.setStyle({
        opacity: display ? 1 : 0
      })
    }
  }

  addSegment (id, points, color, display, filter) {
    const tfLower = (filter.get(0) || points.get(0).get('time')).valueOf()
    const tfUpper = (filter.get(-1) || points.get(-1).get('time')).valueOf()
    const timeFilter = (point) => {
      const t = point.get('time')
      return tfLower <= t && t <= tfUpper
    }
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
      <div ref='map' style={{ height: '100%', zIndex: '1' }}></div>
    )
  }
}
