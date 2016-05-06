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

    this.buttons = []

    opts.map((button) => {
      const b = this._createButton(button, zoomName + '-in', container)
      this.buttons.push(b)
      return b
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
  },

  setEnabled: function (i, is) {
    const c = this.buttons[i]
    if (c) {
      let className = c.className.split(' ')
      if (is) {
        let index = className.indexOf('leaflet-disabled')
        if (index !== -1) {
          className.splice(index, 1)
        }
      } else {
        if (className.indexOf('leaflet-disabled') === -1) {
          className.push('leaflet-disabled')
        }
      }
      c.className = className.join(' ')
    }
  }

})

export default ControlButton
