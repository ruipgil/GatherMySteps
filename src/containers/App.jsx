import React from 'react'
import Dropzone from 'components/Dropzone'
import Container from 'components/Container'
import loadFiles from '../loadFiles'
import { connect } from 'react-redux'
import { addMultipleTracks } from 'actions/tracks'
import { toggleRemainingTracks, toggleConfig } from 'actions/ui'
import { undo, redo, nextStep, previousStep, skipDay } from 'actions/progress'

const GMS = !process.env.BUILD_GPX

const App = ({ showConfig, step, dispatch }) => {
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

  let metaDown = false
  const downKeyHandler = (event) => {
    const { keyCode } = event
    const key = String.fromCharCode(event.keyCode)

    if (event.ctrlKey || metaDown) {
      switch (key) {
        case 'Y': return dispatch(redo())
        case 'Z': return dispatch(undo())
        case 'J':
          if (step === 0) {
            return dispatch(skipDay())
          } else {
            return dispatch(previousStep())
          }
        case 'K': return dispatch(nextStep())
        case 'B': return dispatch(toggleConfig())
        case 'I': return dispatch(toggleRemainingTracks())
      }
    }
    metaDown = (keyCode === 91 || keyCode === 224 || keyCode === 17)
  }

  const keyHandler = (event, e2) => {
    const { keyCode } = event
    if (metaDown && (keyCode === 91 || keyCode === 224 || keyCode === 17)) {
      metaDown = false
    }
  }

  const content = (
    <Container
      onKeyUp={keyHandler}
      onKeyDown={downKeyHandler}
      showConfig={showConfig}
      step={step} />
  )

  if (!GMS) {
    return (
      <Dropzone id='container' onDrop={onDrop} >
        { content }
      </Dropzone>
    )
  } else {
    return content
  }
}

const mapStateToProps = (state) => ({
  step: state.get('progress').get('step'),
  showConfig: state.get('ui').get('showConfig')
})

export default connect(mapStateToProps)(App)
