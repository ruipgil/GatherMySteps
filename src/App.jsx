import React from 'react'
import { connect } from 'react-redux'
import { addTrack } from './actions.jsx'
//import trackStore from './trackStore.jsx'

import LeafletMap from './LeafletMap.jsx'
import Dropzone from './Dropzone.jsx'

import drop from './droparea.jsx'
import loadFiles from './loadFiles.jsx'

let App = ({ tracks, dispatch }) => {
  const onDrop = (e) => {
    let dt = e.dataTransfer
    let files = dt.files

    loadFiles(files, (gpx)=>{
      const tracks = gpx.trk.map((trk) => {
        dispatch(addTrack(trk.trkseg.map((seg) => {
          return seg.trkpt
        })))
      })
    })
  }

  return (
    <Dropzone id="container" onDrop={onDrop}>
      <div id='details'>
        <ul>
          {
            tracks.map((track, i)=>{
              return <li key={i}>{i}</li>
            })
          }
        </ul>
      </div>
      <LeafletMap tracks={tracks} />
    </Dropzone>
  )
}

const mapStateToProps = (state) => {
  console.log("maping")
  console.log(state)
  return {
    tracks: state.tracks
  }
}

App = connect(mapStateToProps)(App)

export default App
