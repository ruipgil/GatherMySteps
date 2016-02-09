import React from 'react'
import { connect } from 'react-redux'
import { GXParser } from 'gxparser'
import { addTrack, toggleTrackDisplay } from '../actions'
import Dropzone from '../components/Dropzone.jsx'
import LeafletMap from '../components/LeafletMap.jsx'

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

  const toggleTrack = (trackIndex) => {
    return () => {
      dispatch(toggleTrackDisplay(trackIndex))
    }
  }


  return (
    <Dropzone id="container" onDrop={onDrop}>
      <div id='details'>
        <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
          {
            tracks.map((track, i)=>{
              return (
                <li key={i} style={{borderLeft:'10px solid '+track.color, paddingLeft: '0.8em', opacity: track.display?1:0.5, cursor: 'pointer'}} onClick={toggleTrack(i)} >
                  <div style={{fontSize: '1.5rem'}}>{track.name} <span style={{fontSize: '0.8rem', color: 'gray'}}>{track.points[0].length} points</span></div>
                  <div style={{fontSize: '0.8rem', color: 'gray'}}>{Date.parse(track.start).toLocaleString()} - {Date.parse(track.end).toLocaleString()}</div>
                  <div></div>
                </li>
              )
            })
          }
        </ul>
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
