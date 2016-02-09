import { Polyline } from 'react-leaflet'
import { icon } from 'leaflet'
import { PolylineEditor } from 'leaflet-editable-polyline'

export default class EditablePolyline extends Polyline {
  componentWillMount () {
    let options = {}
    for (let key in this.props) {
      if (this.props.hasOwnProperty(key)) {
        options[key] = this.props[key]
      }
    }
    options.pointIcon = icon({
      iconUrl: '/pointIcon.svg',
      iconSize: [11, 11],
      iconAnchor: [6, 6]
    })
    options.newPointIcon = icon({
      iconUrl: '/newPointIcon.svg',
      iconSize: [11, 11],
      iconAnchor: [6, 6]
    })
    this.leafletElement = PolylineEditor(this.props.positions, options)
  }
}
