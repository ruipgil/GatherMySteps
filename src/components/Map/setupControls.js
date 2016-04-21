import React from 'react'
import { Control } from 'leaflet'
import ControlButton from './ControlButton'

export default (map, actions) => {
  new Control.Zoom({
    position: 'topright'
  }).addTo(map)

  new ControlButton([
    {
      button: (<i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-undo' />),
      title: 'Undo',
      onClick: actions.undo
    },
    {
      button: (<i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-repeat' />),
      title: 'Redo',
      onClick: actions.redo
    }
  ]).addTo(map)

  new ControlButton({
    button: (<i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-map-marker' />),
    title: 'Position on your location',
    onClick: () => map.locate({setView: true})
  }).addTo(map)
}
