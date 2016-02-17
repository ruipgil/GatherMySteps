import React from 'react'
import { toggleSegmentDisplay, toggleSegmentEditing, removeSegment, toggleSegmentSpliting, toggleSegmentJoining, updateBounds } from '../actions'

const SegmentRepresentation = ({ dispatch, segment }) => {
  const { id, name, points, start, end, display, color, editing, spliting, joining } = segment
  const toggleTrack = (segmentIndex) => {
    return () => dispatch(toggleSegmentDisplay(segmentIndex))
  }
  const toggleEdit = (segmentIndex) => {
    return () => dispatch(toggleSegmentEditing(segmentIndex))
  }
  const remove = (segmentIndex) => {
    return () => dispatch(removeSegment(segmentIndex))
  }
  const toggleJoin = (segmentIndex) => {
    return () => dispatch(toggleSegmentJoining(segmentIndex))
  }
  const toggleSplit = (segmentIndex) => {
    return () => dispatch(toggleSegmentSpliting(segmentIndex))
  }
  const fit = (segmentIndex) => {
    return () => dispatch(updateBounds(segment.bounds))
  }
  return (
    <div>
    <div>
      <li style={{borderLeft: '10px solid ' + color, paddingLeft: '2%', opacity: display ? 1 : 0.5, cursor: 'pointer'}} >
        <div onClick={toggleTrack(id)}>
          <div style={{fontSize: '1rem', color: 'gray'}}>{name.length === 0 ? 'untitled' : name} <span style={{fontSize: '0.8rem', color: 'gray'}}>{points.length} points</span></div>
          <div style={{fontSize: '0.8rem', color: 'gray'}}>{start.format('L')} - {end.format('L')}, {end.fromNow()}</div>
          <div style={{fontSize: '0.8rem', color: 'gray'}}>{start.format('LT')} - {end.format('LT')}, {start.to(end, true)}</div>
        </div>

        <div style={{marginTop: '2px'}}>
          <div className='x-btn' onClick={remove(id)}><img src='/rubbish7.svg' alt='Remove' title='Remove' /></div>
          <div className='x-btn' onClick={fit(id)} ><img src='/size2.svg' alt='Fit' title='Fit to view' /></div>
          <div className='x-btn' onClick={toggleEdit(id)} style={{backgroundColor: editing ? '#ddd' : '#fff'}}><img src='/pencils13.svg' alt='Edit' title='Edit' /></div>
          <div className='x-btn' onClick={toggleSplit(id)} style={{backgroundColor: spliting ? '#ddd' : '#fff'}}><img src='/increase.svg' alt='Split' title='Split' /></div>
          <div className='x-btn' onClick={toggleJoin(id)} style={{backgroundColor: joining ? '#ddd' : '#fff'}}><img src='/resize4.svg' alt='Join' title='Join' /></div>
        </div>
      </li>
    </div>
    </div>
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
