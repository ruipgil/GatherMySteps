import React from 'react'
import { connect } from 'react-redux'
import TrackRepresentation from '../components/TrackRepresentation.jsx'
import SemanticEditor from '../components/SemanticEditor.jsx'

let TrackList = ({ dispatch, tracks, segments, stage }) => {
  if (stage <= 0) {
    return (
      <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
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
      <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
        <SemanticEditor />
      </ul>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    tracks: state.get('tracks').get('tracks'),
    segments: state.get('tracks').get('segments'),
    stage: state.get('progress')
  }
}

TrackList = connect(mapStateToProps)(TrackList)

export default TrackList
