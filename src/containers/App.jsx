import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { GXParser } from 'gxparser'
import { addTrack } from '../actions'
import Dropzone from '../components/Dropzone.jsx'
import LeafletMap from '../components/LeafletMap.jsx'
import TrackList from '../components/TrackList.jsx'

function loadFiles (files, cb) {
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    /*global FileReader*/
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onloadend = () => {
      let gpx = GXParser(reader.result)
      gpx.trk = gpx.trk.map((track) => {
        return {
          trkseg: track.trkseg.map((segment) => {
            return {
              trkpt: segment.trkpt.map((point) => {
                return {
                  lat: Number(point.lat),
                  lon: Number(point.lon),
                  time: moment(point.time[0])
                }
              })
            }
          })
        }
      })
      cb(gpx, file)
    }
  }
}

let App = ({ tracks, dispatch }) => {
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
  let a = tracks.map((track) => track.segments.filter((segment) => segment.display))

  return (
    <Dropzone id='container' onDrop={onDrop} >
      <div id='title'>GatherMySteps</div>
      <div id='details'>
        <TrackList tracks={tracks} dispatch={dispatch} />
      </div>
      <LeafletMap tracks={a} />
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
