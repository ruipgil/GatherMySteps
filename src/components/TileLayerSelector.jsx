import React from 'react'
import { TileLayer } from 'react-leaflet'
import GoogleTileLayer from './GoogleTileLayer.jsx'

const TileLayerSelector = (map) => {
  switch (map) {
    case 'google_sattelite':
      return (<GoogleTileLayer mapType='SATELLITE' />)
    case 'google_road':
      return (<GoogleTileLayer mapType='ROADMAP' />)
    case 'google_hybrid':
      return (<GoogleTileLayer mapType='HYBRID' />)
    case 'google_terrain':
      return (<GoogleTileLayer mapType='TERRAIN' />)
    default:
      return (
        <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      )
  }
}

export default TileLayerSelector
