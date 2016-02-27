import { Google } from 'leaflet-plugins/layer/tile/Google.js'
import { BaseTileLayer } from 'react-leaflet'

export default class GoogleTileLayer extends BaseTileLayer {
  componentWillMount () {
    const { mapType, map } = this.props
    this.leafletElement = new Google(mapType)
    map.addLayer(this.leafletElement)
    super.componentWillMount()
  }
  componentDidUpdate () {
    const { mapType, map } = this.props
    map.removeLayer(this.leafletElement)
    this.leafletElement = new Google(mapType)
    map.addLayer(this.leafletElement)
    super.componentDidUpdate()
  }
}
