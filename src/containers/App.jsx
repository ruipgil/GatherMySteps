import React from 'react'
import { connect } from 'react-redux'
import { GXParser } from 'gxparser'
import { addTrack, toggleTrackDisplay } from '../actions'
import Dropzone from '../components/Dropzone.jsx'
import LeafletMap from '../components/LeafletMap.jsx'
import TrackList from '../components/TrackList.jsx'

function loadFiles(files, cb) {
  for (var i=0; i<files.length; i++) {
    var file = files[i]
    var reader = new FileReader()
    reader.readAsText(file)
    reader.onloadend = function() {
      var gpx = GXParser(reader.result)
      cb(gpx, file)
    }
  }
}


let App = ({ tracks, dispatch }) => {

  const onDrop = (e) => {
    let dt = e.dataTransfer
    let files = dt.files

    loadFiles(files, (gpx, file)=>{
      const tracks = gpx.trk.map((trk) => {
        const trackPoints = trk.trkseg.map((seg) => seg.trkpt)
        dispatch(addTrack(trackPoints, file))
      })
    })
  }

  const dropInfo = (
    <div className='dropInfo' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem', color: 'gray', border: '2px dashed gray', height: '90%'}} >
      Drop files inside
    </div>
  )

  return (
    <Dropzone id="container" onDrop={onDrop} >
      <div id='title'>GatherMySteps</div>
      <div id='details'>
        <TrackList tracks={tracks} dispatch={dispatch} />
      </div>
      <LeafletMap tracks={tracks.filter((track)=>track.display)} />
    </Dropzone>
  )
}

const mapStateToProps = (state) => {
  return {
    tracks: state.tracks
  }
}

App = connect(mapStateToProps)(App)

export default App
