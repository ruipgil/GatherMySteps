import React from 'react'
import { connect } from 'react-redux'
import {
  downloadTrack,
  toggleTrackRenaming,
  updateTrackName
} from 'actions/tracks'

const TrackName = ({ dispatch, trackId, renaming, name }) => {
  const updateName = (e) => {
    if (e.type) {
      const val = e.target.value
      dispatch(updateTrackName(trackId, val))
    }
  }
  const toggleEditing = () => dispatch(toggleTrackRenaming(trackId))
  const onDownload = () => dispatch(downloadTrack(trackId))

  if (renaming) {
    return (
      <div className='control is-grouped has-addons'>
        <input className='input' type='text' value={name} onChange={updateName} />
        <a className='button is-info' onClick={toggleEditing}>
          <i className='fa fa-check' />
        </a>
      </div>
    )
  } else {
    let downloadButton = null
    if (process.env.BUILD_GPX) {
      downloadButton = (
        <a className='float-right clickable icon' onClick={onDownload}>
          <i className='fa fa-download' />
        </a>
      )
    }
    return (
      <div>
        { downloadButton }
        <a onClick={toggleEditing} style={{ color: '#666' }}>{name}</a>
      </div>
    )
  }
}

const mapStateToProps = (state, { trackId }) => {
  const { name, renaming } = state.get('tracks').get('tracks').get(trackId)
  return {
    name: name || 'Untitled.gpx',
    trackId,
    renaming
  }
}

export default connect(mapStateToProps)(TrackName)

