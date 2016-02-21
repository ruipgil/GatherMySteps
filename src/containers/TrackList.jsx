import React from 'react'
import { connect } from 'react-redux'
import TrackRepresentation from '../components/TrackRepresentation.jsx'

let TrackList = ({ dispatch, tracks }) => {
  return (
    <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
      {
        tracks.map((track, i) => {
          return <TrackRepresentation dispatch={dispatch} track={track} key={i} />
        })
      }
    </ul>
  )
}

const mapStateToProps = (state) => {
  return {
    tracks: state.tracks
  }
}

TrackList = connect(mapStateToProps)(TrackList)

export default TrackList
