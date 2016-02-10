import React from 'react'
import { toggleSegmentDisplay } from '../actions'

const SegmentRepresentation = ({ dispatch, segment }) => {
  const { id, name, points, start, end, display, color } = segment
  const toggleTrack = (segmentIndex) => {
    return () => dispatch(toggleSegmentDisplay(segmentIndex))
  }
  return (
    <li style={{borderLeft: '10px solid ' + color, paddingLeft: '2%', opacity: display ? 1 : 0.5, cursor: 'pointer'}} onClick={toggleTrack(id)} >
      <div style={{fontSize: '1rem', color: 'gray'}}>{name.length === 0 ? 'untitled' : name} <span style={{fontSize: '0.8rem', color: 'gray'}}>{points.length} points</span></div>
      <div style={{fontSize: '0.8rem', color: 'gray'}}>{start.format('L')} - {end.format('L')}, {end.fromNow()}</div>
      <div style={{fontSize: '0.8rem', color: 'gray'}}>{start.format('LT')} - {end.format('LT')}, {start.to(end, true)}</div>
      <div></div>
    </li>
  )
}

const TrackRepresentation = ({ dispatch, track }) => {
  const { name, segments } = track
  return (
    <div style={{paddingLeft: '2%'}} >
      <div style={{fontSize: '1.5rem'}}>{name} <span style={{fontSize: '0.8rem', color: 'gray'}}>{segments.length} segment{segments.length === 1 ? '' : 's'}</span></div>
      <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
        {
          segments.map((s, i) => <SegmentRepresentation dispatch={dispatch} segment={s} key={i} />)
        }
      </ul>
    </div>
  )
}

export default TrackRepresentation
