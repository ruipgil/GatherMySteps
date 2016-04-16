import React from 'react'
import TimeSlider from 'components/TimeSlider'
// import { connect } from 'react-redux'
import {
  toggleSegmentEditing,
  removeSegment,
  toggleSegmentSpliting,
  toggleSegmentJoining,
  toggleSegmentPointDetails,
  toggleTimeFilter,
  updateTimeFilterSegment
} from '../actions/segments'
import { updateBounds } from '../actions/ui'

const btnHighlight = ' is-success is-outlined'

let SegmentToolbox = ({ dispatch, segment }) => {
  const id = segment.get('id')
  const start = segment.get('start')
  const end = segment.get('end')
  const editing = segment.get('editing')
  const spliting = segment.get('spliting')
  const joining = segment.get('joining')
  const pointDetails = segment.get('pointDetails')
  const bounds = segment.get('bounds').toJS()
  const showTimeFilter = segment.get('showTimeFilter')
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
  return (
    <div>
      <div style={{ marginTop: '2px', display: 'flex', justifyContent: 'space-around' }}>
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
    </div>
  )
}

/*
const mapStateToProps = (state, { id, segment }) => {
  segment = segment || state.get('tracks').get('segments').get(id)
  return {
    editing: segment.get('editing'),
    spliting: segment.get('spliting'),
    joining: segment.get('joining'),
    pointDetails: segment.get('pointDetails'),
    showTimeFilter: segment.get('showTimeFilter'),
    start: segment.get('start'),
    end: segment.get('end'),
    bounds: segment.get('bounds'),
    id
  }
}

SegmentToolbox = connect(mapStateToProps)(SegmentToolbox)*/

export default SegmentToolbox
