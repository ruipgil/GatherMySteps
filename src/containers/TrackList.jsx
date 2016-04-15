import React from 'react'
import { connect } from 'react-redux'
import TrackRepresentation from '../components/TrackRepresentation.jsx'

let TrackList = ({ dispatch, tracks, segments, className }) => {
  if (tracks.count() !== 0) {
    return (
      <ul className={className}>
      {
        tracks.map((track, i) => {
          const trackSegments = track.get('segments').map((id) => segments.get(id))
          return <TrackRepresentation dispatch={dispatch} track={track} segments={trackSegments} key={i} />
        })
      }
      </ul>
    )
  } else {
    return (
      <div className='dropInfo'>
        Drop .gpx files here
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    tracks: state.get('tracks').get('tracks'),
    segments: state.get('tracks').get('segments')
  }
}

TrackList = connect(mapStateToProps)(TrackList)

export default TrackList
