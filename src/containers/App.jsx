import React from 'react'
import { connect } from 'react-redux'
import { addMultipleTracks } from 'actions/tracks'
import Dropzone from '../components/Dropzone.jsx'
import LeafletMap from './LeafletMap.jsx'
import Progress from './Progress.jsx'
import ProgressBar from './ProgressBar.jsx'

import AlertBox from 'containers/AlertBox'

import loadFiles from '../loadFiles'
import ConfigPane from 'containers/ConfigPane'

import { nextStep, undo, redo } from '../actions/progress'

const GMS = !process.env.BUILD_GPX

let App = ({ showConfig, ui, tracks, dispatch, ...props }) => {
  const onDrop = (e) => {
    let dt = e.dataTransfer
    let files = dt.files

    loadFiles(files, (tracks) => {
      const r = tracks.map((track) => {
        const { gpx, name } = track
        return {
          segments: gpx.trk.map((trk) => trk.trkseg.map((seg) => seg.trkpt)),
          name
        }
      })
      dispatch(addMultipleTracks(r))
    })
  }

  const onNext = (e) => {
    dispatch(nextStep())
      .then(() => {
      })
  }

  const onPrevious = (e) => {
  }

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

  let belowTitle
  if (GMS) {
    belowTitle = <ProgressBar />
  } else {
    belowTitle = (
      <a id='title' href='https://github.com/ruipgil/GatherMySteps' style={{ fontSize: '1rem', marginTop: '-0.7rem' }}>
        by GatherMySteps
      </a>
    )
  }

  const title = GMS ? 'GatherMySteps' : <a href='./'>GPXplorer</a>

  const topPanel = (
    <div>
      <div id='title'>{ title }</div>
      { belowTitle }
    </div>
  )

  const content = (
    <div id='container' onKeyUp={keyHandler} onKeyDown={downKeyHandler} >
      { showConfig ? <ConfigPane /> : null }
      <AlertBox />
      <div id='float-container'>
        { topPanel }
        <Progress onNext={ onNext } onPrevious={ onPrevious } />
      </div>
      <LeafletMap />
    </div>
  )

  if (GMS) {
    return (
      <Dropzone id='container' onDrop={onDrop} >
        { content }
      </Dropzone>
    )
  } else {
    return content
  }
}

const mapStateToProps = (state) => {
  return {
    showConfig: state.get('ui').get('showConfig')
  }
}

App = connect(mapStateToProps)(App)

export default App
