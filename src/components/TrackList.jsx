import React from 'react'
import TrackRepresentation from './TrackRepresentation.jsx'

const TrackList = ({ dispatch, tracks }) => {
  return (
    <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
      {
        tracks.map((track, i)=>{
          return <TrackRepresentation dispatch={dispatch} track={track} key={i} />
        })
      }
    </ul>
  )
}

export default TrackList
