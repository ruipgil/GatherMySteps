import React from 'react'
import { connect } from 'react-redux'
import Track from 'components/Track'
import {
  downloadTrack,
  updateTrackName
} from 'actions/tracks'
import { toggleRemainingTracks } from 'actions/ui'

const GMS = !process.env.BUILD_GPX

const LOADING = <span className='button is-large is-loading' style={{ border: 0 }}>Loading</span>

const DROP_FILES = (
  <div className='dropInfo'>
    Drop .gpx files here
  </div>
)

const style = {
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  justifyContent: 'center',
  width: '100%'
}

let TrackList = ({ dispatch, tracks, className, step, remainingCount }) => {
  if (tracks.count() !== 0) {
    return (
      <ul className={className}>
        {
          tracks.map((track, i) => {
            const remaining = '+' + remainingCount + ' days'
            const trackId = track.get('id')
            const updateName = (newName) => dispatch(updateTrackName(trackId, newName))
            const onDownload = () => dispatch(downloadTrack(trackId))
            const onToggleList = () => dispatch(toggleRemainingTracks())
            return <Track trackId={trackId} key={i} onRename={updateName} onDownload={onDownload} onToggleRemainingTracks={onToggleList} remaining={remaining} />
          })
        }
      </ul>
    )
  } else if (GMS) {
    return (
      <div style={style}>
        { step === -2 ? LOADING : null }
      </div>
    )
  } else {
    return DROP_FILES
  }
}

const mapStateToProps = (state) => {
  const findStart = (track) => {
    return track
      .get('segments').toList().map((segmentId) => {
        return state.get('tracks').get('segments').get(segmentId)
      })
      .sort((a, b) => {
        return a.getStartTime().diff(b.getStartTime())
      })
      .get(0)
  }
  const tracks = state
    .get('tracks').get('tracks').valueSeq().sort((a, b) => {
      return findStart(a).diff(findStart(b))
    })
  return {
    tracks,
    step: state.get('progress').get('step'),
    remainingCount: state.get('progress').get('remainingTracks').count()
  }
}

TrackList = connect(mapStateToProps)(TrackList)

export default TrackList
