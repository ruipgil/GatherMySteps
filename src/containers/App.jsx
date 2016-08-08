import React from 'react'
import Dropzone from 'components/Dropzone'
import Container from 'components/Container'
import loadFiles from '../loadFiles'
import { connect } from 'react-redux'
import { undo, redo } from 'actions/progress'
import { addMultipleTracks } from 'actions/tracks'

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

  const content = (
    <Container
      keyHandler={keyHandler}
      downKeyHandler={downKeyHandler}
      showConfig={showConfig}
      step={step} />
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

const mapStateToProps = (state) => ({
  step: state.get('progress').get('step'),
  showConfig: state.get('ui').get('showConfig')
})

export default connect(mapStateToProps)(App)
