import { map, latLngBounds } from 'leaflet'
// import { Google } from 'leaflet-plugins/layer/tile/Google.js'
import React, { Component } from 'react'
import { Set } from 'immutable'
import { findDOMNode } from 'react-dom'
import {
  extendSegment,
  splitSegment,
  changeSegmentPoint,
  addSegmentPoint,
  removeSegmentPoint,
  joinSegment
} from 'actions/segments'
import { undo, redo } from 'actions/progress'
import { toggleConfig } from 'actions/ui'

import setupControls from './setupControls'
import setupTileLayers from './setupTileLayers'

import editMode from './editMode'
import joinMode from './joinMode'
import splitMode from './splitMode'
import detailMode from './detailMode'
import addSegment from './addSegment'
import updatePoints from './updatePoints'
import pointActionMode from './pointActionMode'

import { createMarker, createPointIcon } from './utils'

import buildTransportationModeRepresentation from './buildTransportationModeRepresentation'

export default class LeafletMap extends Component {
  constructor (props) {
    super(props)

    this.detailLevel = props.detailLevel || 18
    this.transportationModeLevel = props.transportationModeLevel || 12
    this.map = undefined
    /**
     * Holds the segments currently displayed in their leaflet form
     *  key: segment id
     *  value: object of
     *    {
     *      layergroup: what is being displayed, this element is added and
     *      polyline: the polyline that represents the segment
     *      points: a marker for each point
     *      tearDown: undos the changes made by the different modes,
     *        it should put the map in the initial state
     *    }
     *    this should be reconstructed each time there is an update to the points or the visualization mode.
     */
    this.segments = {}

    this.pointHighlights = []
    this.fitBounds = null
    this.updateFitBounds()
  }

  updateFitBounds () {
    const floatContainer = document.querySelector('#float-container')
    const left = floatContainer ? floatContainer.offsetWidth : 0
    this.fitBounds = {
      paddingTopLeft: [left, 0]
    }
  }

  componentDidMount () {
    const m = findDOMNode(this.refs.map)
    this.map = map(m, {
      // bounds: this.props.bounds
      zoomControl: false,
      zoomDelta: 0.4,
      zoomSnap: 0.4
    })

    const { dispatch } = this.props
    setupControls(this.map, {
      canUndo: this.props.canUndo,
      canRedo: this.props.canRedo,
      undo: () => dispatch(undo()),
      redo: () => dispatch(redo()),
      config: () => dispatch(toggleConfig())
    })

    setupTileLayers(this.map)

    this.map.fitWorld(this.fitBounds)
    this.map.on('zoomend', this.onZoomEnd.bind(this))
  }

  componentWillUnmount () {
    this.map.remove()
  }

  componentDidUpdate (prev) {
    if (!this.map) {
      return
    }
    const {
      center,
      bounds,
      zoom,
      highlighted,
      highlightedPoints,
      segments,
      dispatch,
      canUndo,
      canRedo,
      pointPrompt
    } = this.props

    if (canUndo !== prev.canUndo) {
      this.map.buttons.setEnabled(0, canUndo)
    }

    if (canRedo !== prev.canRedo) {
      this.map.buttons.setEnabled(1, canRedo)
    }

    this.updateFitBounds()

    this.shouldUpdateZoom(zoom, prev.zoom)
    this.shouldUpdateCenter(center, prev.center)
    this.shouldUpdateBounds(bounds, prev.bounds)
    this.shouldUpdateHighlighted(highlighted, prev.highlighted, segments)
    this.shouldUpdateHighlightedPoints(highlightedPoints, prev.highlightedPoints, segments)
    this.shouldUpdateSegments(segments, prev.segments, dispatch)
    this.shouldUpdatePrompt(pointPrompt, prev.pointPrompt)
  }

  shouldUpdatePrompt (current, previous) {
    if (current !== previous) {
      if (current) {
        this.map.on('click', (e) => {
          const { latlng } = e
          const { lat, lng } = latlng
          const res = { lat: lat, lon: lng }
          current(res)
        })
      } else {
        this.map.off('click')
      }
    }
  }

  shouldUpdateZoom (current, previous) {
    if (current !== previous || this.map.getZoom() !== current) {
      this.map.setZoom(current)
    }
  }

  shouldUpdateCenter (current, previous) {
    if (current !== previous) {
      this.map.setView({ lat: current.lat, lng: current.lon })
    }
  }

  shouldUpdateSegments (segments, previous, dispatch) {
    if (segments !== previous) {
      segments.forEach((segment) => {
        this.shouldUpdateSegment(segment, previous.get(segment.get('id')), dispatch)
      })

      this.shouldRemoveSegments(segments, previous)
    }
  }

  shouldUpdateSegment (current, previous, dispatch) {
    if (current !== previous) {
      const points = current.get('points')
      const color = current.get('color')
      const display = current.get('display')
      const id = current.get('id')
      const filter = current.get('timeFilter')
      const lseg = this.segments[id]

      if (lseg) {
        this.shouldUpdatePoints(lseg, points, filter, previous, color, current)
        this.shouldUpdateColor(lseg, color, previous.get('color'))
        this.shouldUpdateDisplay(lseg, display, previous.get('display'))
        this.shouldUpdateMode(lseg, current, previous)
        this.shouldUpdateTransportationModes(lseg, current, previous)
      } else {
        this.addSegment(id, points, color, display, filter, current, dispatch, previous, current)
      }
    }
  }

  shouldUpdateTransportationModes (lseg, current, previous) {
    if (current.get('transportationModes') !== previous.get('transportationModes')) {
      lseg.layergroup.removeLayer(lseg.transportation)
      lseg.transportation = buildTransportationModeRepresentation(lseg, current)
      this.onZoomEnd()
    }
  }

  shouldUpdateHighlightedPoints (highlighted, previous, allSegments) {
    if (highlighted === previous) {
      return
    }

    this.pointHighlights = this.pointHighlights.filter((point) => {
      this.map.removeLayer(point)
    })

    const icon = createPointIcon(null, null, 'highlight-point', [19, 19])
    highlighted.reduce((arr, point) => {
      const marker = createMarker(point.toJS(), icon)
      this.map.addLayer(marker)
      arr.push(marker)
      return arr
    }, this.pointHighlights)
  }

  shouldUpdateHighlighted (highlighted, previous, allSegments) {
    if (highlighted === previous) {
      return
    }

    const setOpacity = (ids, opacity) => {
      ids.forEach((id) => {
        const lseg = this.segments[id]
        lseg.layergroup.setStyle({
          opacity
        })
        lseg.transportation.getLayers().forEach((m) => m.setOpacity(opacity))

        Object.keys(lseg.specialMarkers).forEach((key) => {
          lseg.specialMarkers[key].setOpacity(opacity)
        })
      })
    }

    const hidden = allSegments.filterNot((s) => highlighted.has(s.get('id'))).map((s) => s.get('id'))

    if (highlighted.count() > 0) {
      setOpacity(highlighted, 1)
      setOpacity(hidden, 0.2)
    } else {
      setOpacity(hidden, 1)
    }
  }

  onZoomEnd (e) {
    const { detailLevel, transportationModeLevel } = this
    const currentZoom = this.map.getZoom()
    if (currentZoom >= detailLevel || currentZoom >= transportationModeLevel) {
      // add layers
      Object.keys(this.segments).forEach((s) => {
        if (this.segments[s]) {
          const { details, transportation, layergroup } = this.segments[s]
          if (layergroup.hasLayer(details) === false && currentZoom >= detailLevel) {
            layergroup.addLayer(details)
          }

          if (layergroup.hasLayer(transportation) === false && transportationModeLevel) {
            layergroup.addLayer(transportation)
          }
        }
      })
    } else {
      // remove layers
      Object.keys(this.segments).forEach((s) => {
        if (this.segments[s]) {
          const { details, transportation, layergroup } = this.segments[s]
          if (layergroup.hasLayer(details) === true) {
            layergroup.removeLayer(details)
          }

          if (layergroup.hasLayer(transportation) === true) {
            layergroup.removeLayer(transportation)
          }
        }
      })
    }
  }

  shouldUpdateMode (lseg, current, previous) {
    if (lseg.updated) {
      lseg.updated = false
      return
    }

    if (lseg.tearDown) {
      lseg.tearDown(current, previous)
    }

    const { dispatch } = this.props
    if (current.get('spliting') === true && current.get('spliting') !== previous.get('spliting')) {
      splitMode(lseg, current, previous, (id, index) => dispatch(splitSegment(id, index)))
    }
    if (current.get('pointDetails') === true && current.get('pointDetails') !== previous.get('pointDetails')) {
      detailMode(lseg, current, previous)
    }
    if (current.get('editing') === true && current.get('editing') !== previous.get('editing') || (current.get('editing') && current.get('points') !== previous.get('points'))) {
      editMode(lseg, current, previous, {
        onRemove: (id, index, lat, lng) => dispatch(removeSegmentPoint(id, index, lat, lng)),
        onAdd: (id, index, lat, lng) => dispatch(addSegmentPoint(id, index, lat, lng)),
        onMove: (id, index, lat, lng) => dispatch(changeSegmentPoint(id, index, lat, lng)),
        onExtend: (id, index, lat, lng) => dispatch(extendSegment(id, index, lat, lng))
      }, dispatch)
    }
    if (current.get('joining') === true && (current.get('joining') !== previous.get('joining') || current.get('joinPossible') !== previous.get('joinPossible'))) {
      joinMode(lseg, current, previous, (id, i, pp) => dispatch(joinSegment(id, i, pp)))
    }
    if (current.get('pointAction') && current.get('pointAction') !== previous.get('pointAction')) {
      pointActionMode(lseg, current, previous)
    }
  }

  shouldUpdateBounds (bounds, prev) {
    let tBounds
    if (bounds) {
      tBounds = latLngBounds([[bounds.minLat, bounds.minLon], [bounds.maxLat, bounds.maxLon]])
    }
    if (bounds !== prev) {
      this.map.fitBounds(tBounds, {
        ...this.fitBounds,
        maxZoom: this.map.getBoundsZoom(tBounds, true)
      })
    }
  }

  shouldUpdatePoints (segment, points, filter, prev, color, current) {
    const buildTimeFilter = (filter, points) => {
      const tfLower = (filter.get(0) || points.get(0).get('time')).valueOf()
      const tfUpper = (filter.get(-1) || points.get(-1).get('time')).valueOf()
      return (point) => {
        const t = point.get('time').valueOf()
        return tfLower <= t && t <= tfUpper
      }
    }
    if (!segment.updated && (points !== prev.get('points') || filter.get(0) !== prev.get('timeFilter').get(0) || filter.get(-1) !== prev.get('timeFilter').get(-1) || current.get('showTimeFilter') !== prev.get('showTimeFilter'))) {
      const c = current.get('showTimeFilter') ? points.filter(buildTimeFilter(filter, points)) : points
      const p = prev.get('showTimeFilter') ? prev.get('points').filter(buildTimeFilter(prev.get('timeFilter'), prev.get('points'))) : prev.get('points')
      updatePoints(segment, c, p, color)
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
        opacity: display ? 1 : 0.2
      })
      Object.keys(segment.specialMarkers).forEach((key) => {
        segment.specialMarkers[key].setOpacity(display ? 1 : 0.2)
      })
    }
  }

  addSegment (id, points, color, display, filter, segment, dispatch, previous, current) {
    const obj = addSegment(id, points, color, display, filter, segment, dispatch, null, current, previous)
    this.segments[id] = obj
    obj.layergroup.addTo(this.map)

    const currentZoom = this.map.getZoom()
    const { detailLevel, transportationModeLevel } = this
    if (currentZoom >= detailLevel) {
      obj.details.addTo(obj.layergroup)
    }
    if (currentZoom >= transportationModeLevel) {
      obj.transportation.addTo(obj.layergroup)
    }
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
