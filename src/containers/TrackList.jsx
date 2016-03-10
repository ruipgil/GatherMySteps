import React from 'react'
import { connect } from 'react-redux'
import TrackRepresentation from '../components/TrackRepresentation.jsx'

let TrackList = ({ dispatch, tracks, segments }) => {
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
}

const mapStateToProps = (state) => {
  return {
    tracks: state.get('tracks').get('tracks'),
    segments: state.get('tracks').get('segments')
  }
}

TrackList = connect(mapStateToProps)(TrackList)

export default TrackList
