import React from 'react'
import toggleSegmentDisplay from '../actions/toggleSegmentDisplay'
import toggleSegmentEditing from '../actions/toggleSegmentEditing'
import removeSegment from '../actions/removeSegment'
import toggleSegmentSpliting from '../actions/toggleSegmentSpliting'
import toggleSegmentJoining from '../actions/toggleSegmentJoining'
import updateBounds from '../actions/updateBounds'
import toggleSegmentPointDetails from '../actions/toggleSegmentPointDetails'

const SegmentRepresentation = ({ dispatch, segment }) => {
  const { id, name, points, start, end, display, color, editing, spliting, joining, pointDetails } = segment
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
  const toggleDetails = (segmentIndex) => {
    return () => dispatch(toggleSegmentPointDetails(segmentIndex))
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
          <div className='x-btn' onClick={toggleDetails(id)} style={{backgroundColor: pointDetails ? '#ddd' : '#fff'}}><img src='/pin.svg' alt='Inspect points' title='Inspect points' /></div>
        </div>
      </li>
    </div>
    </div>
  )
}

export default SegmentRepresentation
