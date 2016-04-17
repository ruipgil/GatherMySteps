import { DivIcon, Marker, Polyline, FeatureGroup } from 'leaflet'

export default (lseg, current, previous, actions) => {
  const id = current.get('id')
  const points = current.get('points')
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
      actions.onMove(id, index, lat, lng)
      lseg.layergroup.removeLayer(group)
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
        helperLine = new Polyline(latlngs.filter((x) => x), { color: current.get('color'), opacity: 0.8 })
        helperLine.addTo(group)
      } else if (e.type === 'move') {
        helperLine.setLatLngs(latlngs.filter((x) => x))
      } else if (e.type === 'moveend') {
        group.removeLayer(helperLine)
      }
    }
  }

  const setupMarker = (marker, type, index, previous, next) => {
    marker.type = type
    marker.index = index
    marker.previous = previous
    marker.next = next
    return marker
  }

  const setupNewMarker = (point, i) => {
    return setupMarker(createMarker(point, newPointIcon), 'NEW', i, i - 1, i)
    .on('moveend click', handler)
    .on('move movestart moveend', visualHelper)
  }

  const setupExistingMarker = (marker, i) => {
    marker.options.draggable = true
    marker.type = 'MOVE'
    marker.previous = i - 1
    marker.next = i + 1
    marker.on('moveend', handler)
    marker.on('contextmenu', removePoint)
    marker.on('move movestart moveend', visualHelper)
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

  let overlay = []
  let prevPoint
  const markers = lseg.points.getLayers()
  points.forEach((point, i) => {
    if (prevPoint) {
      overlay.push(setupNewMarker(pointInBetween(prevPoint, point), i))
    }
    setupExistingMarker(markers[i], i)
    prevPoint = point
  })

  // extend polyline at start
  const first = points.get(0)
  const firstLat = first.get('lat')
  const firstLon = first.get('lon')
  const second = points.get(1)
  const secondLat = second.get('lat')
  const secondLon = second.get('lon')
  const last = points.get(-1)
  const lastLat = last.get('lat')
  const lastLon = last.get('lon')
  const seclast = points.get(-2)
  const seclastLat = seclast.get('lat')
  const seclastLon = seclast.get('lon')
  const fInterpolated = [firstLat - (secondLat - firstLat), firstLon - (secondLon - firstLon)]
  const lInterpolated = [lastLat - (seclastLat - lastLat), lastLon - (seclastLon - lastLon)]

  const extendStart = setupMarker(createMarker(fInterpolated, newPointIcon), 'EXTEND', 0, -1, 0)
  .on('moveend click', handler)
  .on('move movestart moveend', visualHelper)
  overlay.push(extendStart)

  const guideOptions = {
    color: current.get('color'),
    dashArray: '5, 5'
  }
  const extendStartGuide = new Polyline([ lseg.points.getLayers()[0].getLatLng(), fInterpolated ], guideOptions)
  overlay.push(extendStartGuide)
  extendStart.helperLine = extendStartGuide

  const extendEnd = setupMarker(createMarker(lInterpolated, newPointIcon), 'EXTEND', points.count(), points.count() - 1, points.count() - 1)
  .on('moveend click', handler)
  .on('move movestart moveend', visualHelper)
  overlay.push(extendEnd)
  const extendEndGuide = new Polyline([ lseg.points.getLayers()[lseg.points.getLayers().length - 1].getLatLng(), lInterpolated ], guideOptions)
  overlay.push(extendEndGuide)
  extendEnd.helperLine = extendEndGuide

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
