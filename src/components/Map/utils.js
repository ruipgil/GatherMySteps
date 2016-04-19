import { render } from 'react-dom'
import { DivIcon, Marker, FeatureGroup } from 'leaflet'

export const renderToDiv = (component) => {
  const div = document.createElement('div')
  render(component, div)
  return div
}

export const createPointIcon = (color) =>
  new DivIcon({
    className: 'fa editable-point' + (color ? ' border-color-' + color.substr(1) : ''),
    iconAnchor: [12, 12]
  })

export const setupMarker = (marker, index, previous, next, type = 'NORMAL') => {
  marker.index = index
  marker.previous = previous
  marker.next = next
  marker.type = type

  return marker
}

export const createMarker = (point, icon, draggable = false) => new Marker(point, { icon, draggable })

export const createPointsFeatureGroup = (pts, color, pointsEventMap = {}) => {
  const icon = createPointIcon(color)
  const cpts = pts.map((point, i) => {
    return setupMarker(createMarker(point, icon), i, i - 1, i + 1)
  })
  const pointsLayer = new FeatureGroup(cpts)

  return pointsLayer
}
