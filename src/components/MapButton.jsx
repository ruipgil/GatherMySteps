import { render } from 'react-dom'
import { control, DomUtil } from 'leaflet'
import React, { cloneElement } from 'react'
import { MapComponent } from 'react-leaflet'

export class ButtonGroup extends MapComponent {
  onAdd () {
    const container = DomUtil.create('div', 'leaflet-control-zoom leaflet-bar')
    render(<div>{ this.props.children.map((child, i) => {
      if (child.type === Button) {
        const prps = Object.assign({}, {}, child.props)
        prps.container = container
        return cloneElement(child, prps)
      } else {
        return (<a key={i} className='leaflet-control-zoom-in' href='#' {...this.props} >{ child }</a>)
      }
    }) }</div>, container)
    return container
  }

  componentWillMount () {
    this.leafletElement = control('topright')
    this.leafletElement.onAdd = this.onAdd.bind(this)
    this.leafletElement.addTo(this.props.map)
  }
  render () {
    return null
  }
}

export class Button extends MapComponent {
  onAdd () {
    const container = this.props.container || DomUtil.create('div', 'leaflet-control-zoom leaflet-bar')
    const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
    const comps = children.map((child, i) => {
      return (
        <a key={i} className='leaflet-control-zoom-in' href='#' {...this.props} >{ child }</a>
      )
    })
    render(<div>{comps}</div>, container)
    return container
  }

  componentWillMount () {
    if (!this.props.container) {
      this.leafletElement = control('topright')
      this.leafletElement.onAdd = this.onAdd.bind(this)
      this.leafletElement.addTo(this.props.map)
    }
  }
  render () {
    if (!this.props.container) {
      return null
    } else {
      return <a className='leaflet-control-zoom-in' href='#' {...this.props} >{ this.props.children }</a>
    }
  }
}
