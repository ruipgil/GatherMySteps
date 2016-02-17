import { Google } from 'leaflet-plugins/layer/tile/Google.js'
import { BaseTileLayer } from 'react-leaflet'

export default class GoogleTileLayer extends BaseTileLayer {
  componentWillMount () {
    const { detail, map } = this.props
    console.log(detail)
    super.componentWillMount()
    this.leafletElement = new Google(detail)
    map.addLayer(this.leafletElement)
  }
}
