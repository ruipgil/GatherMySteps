import { map, latLngBounds, LatLng } from 'leaflet'
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

import setupControls from './Map/setupControls'
import setupTileLayers from './Map/setupTileLayers'

import editMode from './Map/editMode'
import joinMode from './Map/joinMode'
import splitMode from './Map/splitMode'
import detailMode from './Map/detailMode'
import addSegment from './Map/addSegment'
import updatePoints from './Map/updatePoints'

export default class PerfMap extends Component {
  constructor (props) {
    super(props)
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
  }

  componentDidMount () {
    const m = findDOMNode(this.refs.map)
    this.map = map(m, {
      // bounds: this.props.bounds
      zoomControl: false
    })

    const { dispatch } = this.props
    setupControls(this.map, {
      undo: () => dispatch(undo()),
      redo: () => dispatch(redo())
    })

    setupTileLayers(this.map)

    this.map.fitWorld()
  }

  componentWillUnmount () {
    this.map.remove()
  }

  componentDidUpdate (prev) {
    if (!this.map) {
      return
    }
    const { center, bounds, zoom, segments, dispatch } = this.props

    this.shouldUpdateZoom(zoom, prev.zoom)
    this.shouldUpdateCenter(center, prev.center)
    this.shouldUpdateBounds(bounds, prev.bounds)
    this.shouldUpdateSegments(segments, prev.segments, dispatch)
  }

  shouldUpdateZoom (current, previous) {
    if (current !== previous || this.map.getZoom() !== current) {
      this.map.setZoom(current)
    }
  }

  shouldUpdateCenter (current, previous) {
    let tCenter
    if (current) {
      tCenter = LatLng(current.lat, current.lon || current.lng)
    }
    if (current !== previous || (tCenter && !this.map.getCenter().equals(tCenter))) {
      this.map.setView(tCenter)
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
        this.shouldUpdatePoints(lseg, points, filter, previous, color)
        this.shouldUpdateColor(lseg, color, previous.get('color'))
        this.shouldUpdateDisplay(lseg, display, previous.get('display'))
        this.shouldUpdateMode(lseg, current, previous)
      } else {
        this.addSegment(id, points, color, display, filter, current, dispatch)
      }
    }
  }

  shouldUpdateMode (lseg, current, previous) {
    if (lseg.updated) {
      lseg.updated = false
      console.log('is updated')
      return
    }

    if (lseg.tearDown) {
      lseg.tearDown(current, previous)
    }

    const { dispatch } = this.props
    if (current.get('spliting') && current.get('spliting') !== previous.get('spliting')) {
      splitMode(lseg, current, previous, (id, index) => dispatch(splitSegment(id, index)))
    }
    if (current.get('pointDetails') && current.get('pointDetails') !== previous.get('pointDetails')) {
      detailMode(lseg, current, previous)
    }
    if (current.get('editing') && current.get('editing') !== previous.get('editing') || (current.get('editing') && current.get('points') !== previous.get('points'))) {
      editMode(lseg, current, previous, {
        onRemove: (id, index, lat, lng) => dispatch(removeSegmentPoint(id, index, lat, lng)),
        onAdd: (id, index, lat, lng) => dispatch(addSegmentPoint(id, index, lat, lng)),
        onMove: (id, index, lat, lng) => dispatch(changeSegmentPoint(id, index, lat, lng)),
        onExtend: (id, index, lat, lng) => dispatch(extendSegment(id, index, lat, lng))
      })
    }
    if (current.get('joining') && current.get('joining') !== previous.get('joining')) {
      joinMode(lseg, current, previous, (id, i, pp) => dispatch(joinSegment(id, i, pp)))
    }
  }

  shouldUpdateBounds (bounds, prev) {
    let tBounds
    if (bounds) {
      tBounds = latLngBounds(bounds.toJS())
    }
    if (bounds !== prev) {
      this.map.fitBounds(tBounds)
    }
  }

  shouldUpdatePoints (segment, points, filter, prev, color) {
    if (!segment.updated && (points !== prev.get('points') || filter.get(0) !== prev.get('timeFilter').get(0) || filter.get(-1) !== prev.get('timeFilter').get(-1))) {
      updatePoints(segment, points, prev.get('points'), color)
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

  addSegment (id, points, color, display, filter, segment, dispatch) {
    const obj = addSegment(id, points, color, display, filter, segment, dispatch)
    this.segments[id] = obj
    obj.layergroup.addTo(this.map)
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
