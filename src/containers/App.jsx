import React from 'react'
import { connect } from 'react-redux'
import { addTrack } from '../actions/tracks'
import Dropzone from '../components/Dropzone.jsx'
import LeafletMap from './LeafletMap.jsx'
import Progress from './Progress.jsx'
import ProgressBar from './ProgressBar.jsx'

import loadFiles from '../loadFiles'

import { nextStep, undo, redo } from '../actions/progress'

let App = ({ ui, tracks, dispatch }) => {
  const onDrop = (e) => {
    let dt = e.dataTransfer
    let files = dt.files

    loadFiles(files, (gpx, file) => {
      gpx.trk.forEach((trk) => {
        const trackPoints = trk.trkseg.map((seg) => seg.trkpt)
        dispatch(addTrack(trackPoints, file.name))
      })
    })
  }

  const onNext = (e) => {
    dispatch(nextStep())
      .then(() => {
      })
  }

  const onPrevious = (e) => {
  }

  /*
  const dropInfo = (
    <div className='dropInfo' style={{display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem', color: 'gray', border: '2px dashed gray', height: '90%'}} >
      Drop files inside
    </div>
  )
  */

  let metaDown = false
  const downKeyHandler = (event) => {
    const { keyCode } = event
    metaDown = (keyCode === 91 || keyCode === 224 || keyCode === 17)
  }

  const keyHandler = (event, e2) => {
    const { keyCode } = event
    const key = String.fromCharCode(event.keyCode)
    if ((event.ctrlKey || metaDown) && key === 'Z') {
      dispatch(undo())
    } else if ((event.ctrlKey || metaDown) && key === 'Y') {
      dispatch(redo())
    } else if (keyCode === 91 || keyCode === 224 || keyCode === 17) {
      metaDown = false
    }
  }

  return (
    <Dropzone id='container' onDrop={onDrop} onKeyUp={keyHandler} onKeyDown={downKeyHandler} >
      <div id='float-container'>
        <div id='title'>GatherMySteps</div>
        <div id='details'>
          <Progress onNext={ onNext } onPrevious={ onPrevious } />
        </div>
      </div>
      <ProgressBar />
      <LeafletMap />
    </Dropzone>
  )
}

const mapStateToProps = (state) => {
  return {}
}

App = connect(mapStateToProps)(App)

export default App
