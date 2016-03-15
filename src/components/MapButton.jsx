import { render } from 'react-dom'
import { control, DomUtil } from 'leaflet'
import React, { cloneElement } from 'react'
import { MapComponent } from 'react-leaflet'

export class ButtonGroup extends MapComponent {
  onAdd () {
    const container = DomUtil.create('div', 'leaflet-control-zoom leaflet-bar')
    const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
    const populateProps = (elm, i) => {
      if (Array.isArray(elm)) {
        return elm.map(populateProps)
      } else if (elm.type === Button) {
        const prps = Object.assign({}, {}, elm.props)
        prps.map = this.props.map
        prps.container = container
        return cloneElement(elm, prps)
      } else {
        return (<a key={i} className='leaflet-control-zoom-in' href='#' {...this.props} >{ elm }</a>)
      }
    }
    render(<div>{ children.map((child, i) => {
      return populateProps(child, i)
    }) }</div>, container)
    return container
  }

  componentWillMount () {
    this.leafletElement = control('topright')
    this.leafletElement.onAdd = this.onAdd.bind(this)
    this.leafletElement.addTo(this.props.map)
  }
  componentWillUnmount () {
    this.leafletElement.removeFrom(this.props.map)
  }
  render () {
    return null
  }
}

export class ButtonFoldableGroup extends MapComponent {
  constructor (props) {
    super(props)
    this.state = {
      open: false
    }
  }
  render () {
    const { open } = this.state
    const { map } = this.props
    const toggleOpen = () => {
      this.state.open = !this.state.open
      this.setState(this.state)
    }
    const head = this.props.children[0]
    let newProps = Object.assign({}, {}, this.props)
    newProps.onClick = toggleOpen
    newProps.children = head.props.children
    let FinalHead = cloneElement(head, newProps)

    const childs = this.props.children.slice(1)
    if (open) {
      return (<ButtonGroup map={map}>{ FinalHead }{ childs }</ButtonGroup>)
    } else {
      return FinalHead
    }
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

  componentWillUnmount () {
    this.leafletElement.removeFrom(this.props.map)
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
