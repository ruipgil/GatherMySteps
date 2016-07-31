import React from 'react'
import TimeSlider from 'components/TimeSlider'
import AsyncButton from 'components/AsyncButton'
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
import { updateBounds, addAlert, removeAlert } from '../actions/ui'

const btnHighlight = ' is-success is-outlined'

let SegmentToolbox = ({ dispatch, segment }) => {
  const id = segment.get('id')
  const start = segment.get('points').get(0).get('time')
  const end = segment.get('points').get(-1).get('time')
  const editing = segment.get('editing')
  const spliting = segment.get('spliting')
  const joining = segment.get('joining')
  const pointDetails = segment.get('pointDetails')
  const bounds = segment.get('bounds').toJS()
  const showTimeFilter = segment.get('showTimeFilter')
  const filterStart = segment.get('timeFilter').get(0)
  const filterEnd = segment.get('timeFilter').get(1)

  const INFO_TIME = 100

  const toggleEdit = (segmentIndex) => {
    return () => {
      dispatch(toggleSegmentEditing(segmentIndex))

      const ref = 'EDIT_INFO'
      if (!editing) {
        const action = addAlert((
          <div>
            <div>Editing is only possible at certain zoom levels. Zoom in if you can't see any markers.</div>
            <div>Drag existing points to move their position. Right-click to remove them.</div>
            <div>Drag or click in the (+) marker to add a point.</div>
          </div>
        ), 'success', INFO_TIME, ref)
        dispatch(action)
      } else {
        dispatch(removeAlert(null, ref))
      }
    }
  }

  const remove = (segmentIndex) => {
    return () => dispatch(removeSegment(segmentIndex))
  }
  const toggleJoin = (segmentIndex) => {
    return () => {
      try {
        dispatch(toggleSegmentJoining(segmentIndex))

        const ref = 'JOIN_INFO'
        if (!joining) {
          const action = addAlert((
            <div>
              <div>Joining is only possible at certain zoom levels. Zoom in if you can't see any markers.</div>
              <div>The possible joins are highlighted, click them to join.</div>
            </div>
          ), 'success', INFO_TIME, ref)
          dispatch(action)
        } else {
          dispatch(removeAlert(null, ref))
        }
      } catch (e) {
        dispatch(addAlert(e.message))
      }
    }
  }
  const toggleSplit = (segmentIndex) => {
    return () => {
      dispatch(toggleSegmentSpliting(segmentIndex))

      const ref = 'SPLIT_INFO'
      if (!spliting) {
        const action = addAlert((
          <div>
            <div>Spliting is only possible at certain zoom levels. Zoom in if you can't see any markers.</div>
            <div>Click on a marker to split the segment</div>
          </div>
        ), 'success', INFO_TIME, ref)
        dispatch(action)
      } else {
        dispatch(removeAlert(null, ref))
      }
    }
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
      <div style={{ width: '98%' }} className='control has-addons'>
        <span title='Delete track' className='button icon-button' onClick={remove(id)}>
          <i className='fa fa-trash' />
        </span>

        <span title='Center on map' className='button icon-button' onClick={fit(id)}>
          <i className='fa fa-arrows-alt' />
        </span>

        <AsyncButton
          className={'icon-button' + (editing ? btnHighlight : '')}
          title='Edit points'
          onClick={
            (e, modifier) => {
              modifier('is-loading')
              toggleEdit(id)(e)
            }
          }>
          <i className='fa fa-pencil' />
        </AsyncButton>

        <span title='Split' className={'button icon-button' + (spliting ? btnHighlight : '')} onClick={toggleSplit(id)}>
          <i className='fa fa-expand' />
        </span>

        <span title='Join' className={'button icon-button' + (joining ? btnHighlight : '')} onClick={toggleJoin(id)}>
          <i className='fa fa-compress' />
        </span>

        <span title='Inspect points' className={'button icon-button' + (pointDetails ? btnHighlight : '')} onClick={toggleDetails(id)}>
          <i className='fa fa-map-pin' />
        </span>

        <span title='Filter points by time' className={'button icon-button' + (showTimeFilter ? btnHighlight : '')} onClick={toggleTF(id)}>
          <i className='fa fa-calendar' />
        </span>
      </div>
      {
        showTimeFilter
          ? <TimeSlider start={start} initialStart={filterStart} end={end} initialEnd={filterEnd} onChange={updateFilter(id)}/>
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
