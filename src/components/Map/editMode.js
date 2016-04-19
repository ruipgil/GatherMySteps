import { DivIcon, Marker, Polyline, FeatureGroup } from 'leaflet'

const newPointIcon = new DivIcon({
  className: 'fa fa-plus editable-point new-editable-point',
  iconAnchor: [12, 12]
})

const createMarker = (point) => new Marker(point, { icon: newPointIcon, draggable: true })

const setupMarker = (marker, type, index, previous, next) => {
  marker.type = type
  marker.index = index
  marker.previous = previous
  marker.next = next
  return marker
}

const tearDownMarker = (marker) => {
  marker.type = null
  marker.previous = null
  marker.next = null
  if (marker.dragging) {
    marker.dragging.disable()
  }
  marker.off()
}

const interpolatePoint = (first, second) => {
  const firstLat = first.get('lat')
  const secondLat = second.get('lat')
  const firstLon = first.get('lon')
  const secondLon = second.get('lon')
  return [firstLat - (secondLat - firstLat), firstLon - (secondLon - firstLon)]
}

const interpolatePointLeaflet = (first, second) => {
  return [first.lat - (second.lat - first.lat), first.lng - (second.lng - first.lng)]
}

const pointInBetween = (prev, after) => {
  const latDiff = after.get('lat') - prev.get('lat')
  const lonDiff = after.get('lon') - prev.get('lon')

  return [prev.get('lat') + latDiff / 2, prev.get('lon') + lonDiff / 2]
}

const pointInBetweenLeaflet = (prev, after) => {
  const latDiff = after.lat - prev.lat
  const lonDiff = after.lng - prev.lng

  return [prev.lat + latDiff / 2, prev.lng + lonDiff / 2]
}

/**
 * Updates the polyline and new point markers after a
 *   point has been moved. Point markers are updated
 *   by the user, when dragging
 */
const updateMove = (lseg, index, lat, lng, target, glayers) => {
  // update polyline
  const platlangs = lseg.polyline.getLatLngs()
  const ppoint = platlangs[index]
  ppoint.lat = lat
  ppoint.lng = lng
  lseg.polyline.setLatLngs(platlangs)

  // new point marker
  const { previous, next } = target
  if (index === 0) {
    // Updating first point
    const point = pointInBetweenLeaflet(platlangs[1], ppoint)
    glayers[0].setLatLng(point)

    const epoint = interpolatePointLeaflet(ppoint, platlangs[1])
    const ti = glayers[glayers.length - 2].getLayers()
    ti[0].setLatLng(epoint)
  } else if ((index + 1) === platlangs.length) {
    // Updating last point
    const point = pointInBetweenLeaflet(ppoint, platlangs[previous])
    glayers[previous].setLatLng(point)

    const epoint = interpolatePointLeaflet(ppoint, platlangs[previous])
    const ti = glayers[glayers.length - 1].getLayers()
    ti[0].setLatLng(epoint)
  } else {
    glayers[previous].setLatLng(pointInBetweenLeaflet(platlangs[previous], ppoint))
    glayers[index].setLatLng(pointInBetweenLeaflet(ppoint, platlangs[next]))
  }
}

export default (lseg, current, previous, actions) => {
  const id = current.get('id')
  const color = current.get('color')
  const points = current.get('points')

  let group
  let overlay = []

  const removePoint = (e) => {
    const {lat, lng} = e.target.getLatLng()
    actions.onRemove(id, e.target.index, lat, lng)
    lseg.layergroup.removeLayer(group)
  }
  const handler = (e) => {
    const { target } = e
    const { type, index } = target
    const {lat, lng} = target.getLatLng()
    if (type === 'NEW') {
      actions.onAdd(id, index, lat, lng)
      lseg.layergroup.removeLayer(group)
    } else if (type === 'MOVE') {
      lseg.updated = true
      actions.onMove(id, index, lat, lng)
      updateMove(lseg, index, lat, lng, target, overlay)
    } else if (type === 'EXTEND') {
      actions.onExtend(id, index, lat, lng)
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
        helperLine = new Polyline(latlngs.filter((x) => x), { color, opacity: 0.8 })
        helperLine.addTo(group)
      } else if (e.type === 'move') {
        helperLine.setLatLngs(latlngs.filter((x) => x))
      } else if (e.type === 'moveend') {
        group.removeLayer(helperLine)
      }
    }
  }

  const setupNewMarker = (point, i) => {
    return setupMarker(createMarker(point), 'NEW', i, i - 1, i)
    .on('moveend click', handler)
    .on('move movestart moveend', visualHelper)
  }

  const setupExistingMarker = (marker, i) => {
    marker.options.draggable = true
    if (marker.dragging) {
      marker.dragging.enable()
    }
    marker.type = 'MOVE'
    marker.previous = i - 1
    marker.next = i + 1
    marker.on('moveend', handler)
    marker.on('contextmenu', removePoint)
    marker.on('move movestart moveend', visualHelper)
    return marker
  }

  let prevPoint
  const markers = lseg.points.getLayers()
  points.forEach((point, i) => {
    if (prevPoint) {
      overlay.push(setupNewMarker(pointInBetween(prevPoint, point), i))
    }
    setupExistingMarker(markers[i], i)
    prevPoint = point
  })

  const guideOptions = {
    color,
    dashArray: '5, 5'
  }

  const newAndGuide = (point, guideEnd, a, b, c) => {
    const marker = setupMarker(createMarker(point), 'EXTEND', a, b, c)
    .on('moveend click', handler)
    .on('move movestart moveend', visualHelper)

    const guide = new Polyline([ point, guideEnd ], guideOptions)
    marker.helperLine = guide
    return new FeatureGroup([marker, guide])
  }

  // extend polyline
  const startInterpolated = interpolatePoint(points.get(0), points.get(1))
  const startGuide = newAndGuide(startInterpolated, markers[0].getLatLng(), 0, -1, 0)
  overlay.push(startGuide)

  const endInterpolated = interpolatePoint(points.get(-1), points.get(-2))
  const endGuide = newAndGuide(endInterpolated, markers[markers.length - 1].getLatLng(), points.count(), points.count() - 1, points.count() - 1)
  overlay.push(endGuide)

  group = new FeatureGroup(overlay)
  group.addTo(lseg.layergroup)
  lseg.points.addTo(lseg.layergroup)

  lseg.tearDown = (current, previous) => {
    if (!current.get('editing') || (current.get('editing') && current.get('points') !== previous.get('points'))) {
      lseg.layergroup.removeLayer(lseg.points)
      lseg.layergroup.removeLayer(group)
      lseg.points.getLayers().forEach((m) => tearDownMarker(m))
      lseg.tearDown = null
    }
  }
}
