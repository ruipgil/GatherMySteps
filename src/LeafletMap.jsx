import React from 'react'
import {Map, TileLayer, Polyline} from 'react-leaflet'

const LeafletMap = ({ tracks }) => {
  return (
    <Map id="map" center={[13, 0]} zoom={2}>
      <TileLayer
        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {
        tracks.map((track, i) => {
          const t = track[0].map((t)=>{return {lat:Number(t.lat), lon:Number(t.lon)}})
          console.log(t)
          return (
            <Polyline positions={t} key={i} />
          )
        })
      }
    </Map>
  )
}

export default LeafletMap
