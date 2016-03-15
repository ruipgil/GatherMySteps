import React from 'react'
import {
  toggleSegmentDisplay,
  toggleSegmentEditing,
  removeSegment,
  toggleSegmentSpliting,
  toggleSegmentJoining,
  toggleSegmentPointDetails
} from '../actions/segments'
import { updateBounds } from '../actions/ui'

const SegmentRepresentation = ({ dispatch, segment }) => {
  const id = segment.get('id')
  const name = segment.get('name')
  const points = segment.get('points')
  const start = segment.get('start')
  const end = segment.get('end')
  const display = segment.get('display')
  const color = segment.get('color')
  const editing = segment.get('editing')
  const spliting = segment.get('spliting')
  const joining = segment.get('joining')
  const pointDetails = segment.get('pointDetails')
  const bounds = segment.get('bounds').toJS()
  const metrics = segment.get('metrics').toJS()

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
    return () => dispatch(updateBounds(bounds))
  }
  const toggleDetails = (segmentIndex) => {
    return () => dispatch(toggleSegmentPointDetails(segmentIndex))
  }

  let distance = metrics.totalDistance
  let avrgSpeed = metrics.averageVelocity

  const btnHighlight = ' is-success is-outlined'
  return (
    <div>
    <div>
      <li style={{borderLeft: '10px solid ' + color, paddingLeft: '2%', opacity: display ? 1 : 0.5, cursor: 'pointer'}} >
        <div onClick={toggleTrack(id)}>
          <div style={{fontSize: '1rem', color: 'gray'}}>{name.length === 0 ? 'untitled' : name} <span style={{fontSize: '0.8rem', color: 'gray'}}>{points.count()} points</span></div>
          <div style={{fontSize: '0.8rem', color: 'gray'}}>{start.format('L')} - {end.format('L')}, {end.fromNow()}</div>
          <div style={{fontSize: '0.8rem', color: 'gray'}}>{start.format('LT')} - {end.format('LT')}, {start.to(end, true)}</div>
          <div style={{fontSize: '0.8rem', color: 'gray'}}>{ distance.toFixed(2) } km at { avrgSpeed.toFixed(2) } km/h</div>
        </div>

        <div style={{marginTop: '2px'}}>
          <span className='button icon-button' onClick={remove(id)}>
            <i className='fa fa-trash' />
          </span>

          <span className='button icon-button' onClick={fit(id)}>
            <i className='fa fa-arrows-alt' />
          </span>
          <span className={'button icon-button' + (editing ? btnHighlight : '')} onClick={toggleEdit(id)}>
            <i className='fa fa-pencil' />
          </span>
          <span className={'button icon-button' + (spliting ? btnHighlight : '')} onClick={toggleSplit(id)}>
            <i className='fa fa-expand' />
          </span>
          <span className={'button icon-button' + (joining ? btnHighlight : '')} onClick={toggleJoin(id)}>
            <i className='fa fa-compress' />
          </span>
          <span className={'button icon-button' + (pointDetails ? btnHighlight : '')} onClick={toggleDetails(id)}>
            <i className='fa fa-map-pin' />
          </span>
        </div>
      </li>
    </div>
    </div>
  )
}

export default SegmentRepresentation
