import React from 'react'
import { connect } from 'react-redux'
import { addTrack } from '../actions/tracks'
import Dropzone from '../components/Dropzone.jsx'
import LeafletMap from './LeafletMap.jsx'
import TrackList from './TrackList.jsx'

import loadFiles from '../loadFiles'

let App = ({ ui, tracks, dispatch }) => {
  const onDrop = (e) => {
    let dt = e.dataTransfer
    let files = dt.files

    loadFiles(files, (gpx, file) => {
      gpx.trk.forEach((trk) => {
        const trackPoints = trk.trkseg.map((seg) => seg.trkpt)
        dispatch(addTrack(trackPoints, file))
      })
    })
  }

  /*
  const dropInfo = (
    <div className='dropInfo' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem', color: 'gray', border: '2px dashed gray', height: '90%'}} >
      Drop files inside
    </div>
  )
  */

  return (
    <Dropzone id='container' onDrop={onDrop} >
      <div id='title'>GatherMySteps</div>
      <div id='details'>
        <TrackList />
      </div>
      <LeafletMap />
    </Dropzone>
  )
}

const mapStateToProps = (state) => {
  return {}
}

App = connect(mapStateToProps)(App)

export default App
