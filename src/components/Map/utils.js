import { render } from 'react-dom'
import { DivIcon, Marker, FeatureGroup } from 'leaflet'

export const createPointIcon = (color) =>
  new DivIcon({
    className: 'fa editable-point' + (color ? ' border-color-' + color.substr(1) : ''),
    iconAnchor: [12, 12]
  })

export const renderToDiv = (component) => {
  const div = document.createElement('div')
  render(component, div)
  return div
}

export const createPointsFeatureGroup = (pts, color, pointsEventMap = {}) => {
  const icon = createPointIcon(color)
  const cpts = pts.map((point, i) => {
    const p = new Marker(point, { icon, draggable: false })
    p.index = i
    p.previous = i - 1
    p.next = i + 1
    return p
  })
  const pointsLayer = new FeatureGroup(cpts)

  pointsLayer.on(pointsEventMap)
  return pointsLayer
}
