import React from 'react'
import { Control } from 'leaflet'
import ControlButton from './ControlButton'

export default (map, actions) => {
  new Control.Zoom({
    position: 'topright'
  }).addTo(map)

  const btns = new ControlButton([
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
  ])

  btns.addTo(map)

  if (actions.canUndo === false) {
    btns.setEnabled(0, false)
  }
  if (actions.canRedo === false) {
    btns.setEnabled(1, false)
  }

  map.buttons = btns

  new ControlButton({
    button: (<i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-map-marker' />),
    title: 'Position on your location',
    onClick: () => map.locate({setView: true})
  }).addTo(map)

  new ControlButton({
    button: (<i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-wrench' />),
    title: 'Configurations',
    onClick: actions.config
  }).addTo(map)
}
