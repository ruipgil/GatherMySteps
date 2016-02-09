import React from 'react'
import { connect } from 'react-redux'
import { GXParser } from 'gxparser'
import { addTrack } from '../actions'
import Dropzone from '../components/Dropzone.jsx'
import LeafletMap from '../components/LeafletMap.jsx'

function loadFiles(files, cb) {
  for (var i=0; i<files.length; i++) {
    var file = files[i]
    var reader = new FileReader()
    reader.readAsText(file)
    reader.onloadend = function() {
      var gpx = GXParser(reader.result)
      /*var layers = GPXToLayers(gpx)
      cb(layers)*/
      cb(gpx)
    }
  }
}


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
  return {
    tracks: state.tracks
  }
}

App = connect(mapStateToProps)(App)

export default App
