import { Path } from 'react-leaflet'
import { icon } from 'leaflet'
import { PolylineEditor } from 'leaflet-editable-polyline'

export default class EditablePolyline extends Path {
  componentWillMount () {
    super.componentWillMount()
    let options = {}
    for (let key in this.props) {
      if (this.props.hasOwnProperty(key)) {
        options[key] = this.props[key]
      }
    }
    options.pointIcon = icon({
      iconUrl: '/pointIcon.svg',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
    options.newPointIcon = icon({
      iconUrl: '/newPointIcon.svg',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
    options.maxMarkers = 500
    this.leafletElement = PolylineEditor(this.props.positions, options)
  }
  componentDidUpdate (prevProps) {
    if (this.props.positions !== prevProps.positions) {
      this.leafletElement.setLatLngs(this.props.positions);
    }
    this.setStyleIfChanged(prevProps, this.props);
  }
}
