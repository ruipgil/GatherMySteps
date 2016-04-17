import { render } from 'react-dom'
import { Control, DomUtil, DomEvent } from 'leaflet'

const ControlButton = Control.extend({
  options: [],

  onAdd: function (map) {
    const zoomName = 'leaflet-control-zoom'
    const container = DomUtil.create('div', zoomName + ' leaflet-bar')
    const options = this.options

    let opts
    if (Array.isArray(options)) {
      opts = options
    } else if (options['0']) {
      opts = Object.keys(options).sort().map((option) => options[option])
    } else {
      opts = [options]
    }

    opts.map((button) => {
      return this._createButton(button, zoomName + '-in', container)
    })

    return container
  },

  _createButton: function (button, className, container) {
    var link = DomUtil.create('a', className, container)
    if (typeof button.button === 'string') {
      link.innerHTML = button.button || ''
    } else {
      render(button.button || null, link)
    }
    link.href = '#'
    link.title = button.title || ''

    DomEvent
    .on(link, 'mousedown dblclick', DomEvent.stopPropagation)
    .on(link, 'click', DomEvent.stop)
    .on(link, 'click', button.onClick || function () {}, this)
    .on(link, 'click', this._refocusOnMap, this)

    return link
  }
})

export default ControlButton
