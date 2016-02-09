import React from 'react'
import { toggleTrackDisplay } from '../actions'

const TrackRepresentation = ({ dispatch, track }) => {
  const { id, name, points, start, end, color, display } = track
  const toggleTrack = (trackIndex) => {
    return () => {
      dispatch(toggleTrackDisplay(trackIndex))
    }
  }
  return (
    <li style={{borderLeft:'10px solid '+color, paddingLeft: '0.8em', opacity: display?1:0.5, cursor: 'pointer'}} onClick={toggleTrack(id)} >
      <div style={{fontSize: '1.5rem'}}>{name} <span style={{fontSize: '0.8rem', color: 'gray'}}>{points[0].length} points</span></div>
      <div style={{fontSize: '0.8rem', color: 'gray'}}>{Date.parse(start).toLocaleString()} - {Date.parse(end).toLocaleString()}</div>
      <div></div>
    </li>
  )
}

export default TrackRepresentation
