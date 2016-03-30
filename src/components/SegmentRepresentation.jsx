import React from 'react'
import TimeSlider from 'components/TimeSlider'
import {
  toggleSegmentDisplay,
  toggleSegmentEditing,
  removeSegment,
  toggleSegmentSpliting,
  toggleSegmentJoining,
  toggleSegmentPointDetails,
  toggleTimeFilter,
  updateTimeFilterSegment
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
  const showTimeFilter = segment.get('showTimeFilter')

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
  const updateFilter = (segmentIndex) => {
    return (lower, higher) => dispatch(updateTimeFilterSegment(segmentIndex, lower, higher))
  }
  const toggleTF = (segmentIndex) => {
    return () => {
      dispatch(toggleTimeFilter(segmentIndex))
    }
  }

  let distance = metrics.totalDistance
  let avrgSpeed = metrics.averageVelocity

  const btnHighlight = ' is-success is-outlined'
  const style = {
    fontSize: '1rem',
    color: 'gray',
    margin: '0.1rem 0'
  }
  return (
    <div className='slide-from-top-fade-in'>
    <div>
      <li style={{borderLeft: '10px solid ' + color, paddingLeft: '2%', opacity: display ? 1 : 0.5, cursor: 'pointer'}} >
        <div onClick={toggleTrack(id)}>
          <div style={style}>{start.format('L')} - {end.format('L')}</div>
          <div style={style}>{start.format('LT')} - {end.format('LT')}</div>
          <div style={style}>{end.fromNow()} during {start.to(end, true)}</div>
          <div style={style}>{points.count()} points, { distance.toFixed(2) } km at { avrgSpeed.toFixed(2) } km/h</div>
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

          <span className={'button icon-button' + (showTimeFilter ? btnHighlight : '')} onClick={toggleTF(id)}>
            <i className='fa fa-calendar' />
          </span>
        </div>
        {
          showTimeFilter
            ? <TimeSlider start={start} end={end} onChange={updateFilter(id)}/>
            : null
        }
      </li>
    </div>
    </div>
  )
}

export default SegmentRepresentation
