import React from 'react'
import { ButtonFoldableGroup, Button } from './MapButton.jsx'

const ChangeMapProvider = ({ map, mapType, onChange }) => {
  const btnStyle = { minWidth: 'auto', width: 'auto', fontSize: '0.8rem', textAlign: 'left', backgroundColor: 'white' }
  const selectedStyle = (is) => {
    if (is) {
      return Object.assign({}, btnStyle, is ? {backgroundColor: '#BDBDBD'} : {})
    } else {
      return btnStyle
    }
  }

  return (
    <ButtonFoldableGroup style={{ minWidth: '26px', width: 'auto' }} map={map}>
      <Button map={map}>
        <i style={{ font: 'normal normal normal 14px/1 FontAwesome', fontSize: 'inherit' }} className='fa-globe' />
      </Button>
      <Button map={map} style={selectedStyle(!mapType || mapType === 'osm')} onClick={() => onChange('osm')}>OpenStreetMaps</Button>
      <Button map={map} style={selectedStyle(mapType === 'google_sattelite')} onClick={() => onChange('google_sattelite')}>GoogleMaps Sattelite</Button>
      <Button map={map} style={selectedStyle(mapType === 'google_road')} onClick={() => onChange('google_road')}>GoogleMaps Roads</Button>
      <Button map={map} style={selectedStyle(mapType === 'google_hybrid')} onClick={() => onChange('google_hybrid')}>GoogleMaps Hybrid</Button>
      <Button map={map} style={selectedStyle(mapType === 'google_terrain')} onClick={() => onChange('google_terrain')}>GoogleMaps Terrain</Button>
    </ButtonFoldableGroup>
  )
}

export default ChangeMapProvider
