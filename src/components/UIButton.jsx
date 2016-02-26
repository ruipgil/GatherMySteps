import { Component } from 'react'
import { EasyButton } from 'leaflet-easybutton'
// import '../../node_modules/leaflet-easybutton/easy-button.css'

export default class UIButton extends Component {
  componentWillMount () {
    const { image, onClick, map } = this.props
    this.leafletElement = EasyButton('<img src="' + image + '" />', onClick || function () {})
    console.log(this.leafletElement)
    this.leafletElement.addTo(map)
  }
  render () {
    return null
  }
}
