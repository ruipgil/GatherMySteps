import React from 'react'
import { connect } from 'react-redux'
import TimeSlider from 'components/TimeSlider'
import {
  toggleSegmentEditing,
  removeSegment,
  toggleSegmentSpliting,
  toggleSegmentJoining,
  toggleSegmentPointDetails,
  toggleTimeFilter,
  updateTimeFilterSegment,
  fitSegment
} from '../actions/segments'
import { addAlert, removeAlert } from '../actions/ui'

const INFO_TIME = 100

const ToolboxButton = ({ icon, title, onClick, highlighted, disabled }) => {
  const className = ['button', 'icon-button']
  if (highlighted) {
    className.push('is-success', 'is-outlined')
  }
  if (disabled) {
    className.push('is-disabled')
  }
  return (
    <span title={title} className={className.join(' ')} onClick={disabled ? null : onClick}>
      <i className={'fa fa-' + icon} />
    </span>
  )
}

const EDIT_ALERT = (
  <div>
    <div>Editing is only possible at certain zoom levels. Zoom in if you can't see any markers.</div>
    <div>Drag existing points to move their position. Right-click to remove them.</div>
    <div>Drag or click in the (+) marker to add a point.</div>
  </div>
)

const JOIN_ALERT = (
  <div>
    <div>Joining is only possible at certain zoom levels. Zoom in if you can't see any markers.</div>
    <div>The possible joins are highlighted, click them to join.</div>
  </div>
)

const SPLIT_ALERT = (
  <div>
    <div>Spliting is only possible at certain zoom levels. Zoom in if you can't see any markers.</div>
    <div>Click on a marker to split the segment</div>
  </div>
)

const toggleAlert = (dispatch, ref, alert, should) => {
  if (should) {
    dispatch(removeAlert(null, ref))
  } else {
    dispatch(addAlert(alert, 'success', INFO_TIME, ref))
  }
}

let SegmentToolbox = ({ dispatch, segmentId, start, end, editing, spliting, joining, pointDetails, showTimeFilter, filterStart, filterEnd }) => {
  const toggleEdit = () => {
    dispatch(toggleSegmentEditing(segmentId))
    toggleAlert(dispatch, 'EDIT_INFO', EDIT_ALERT, editing)
  }
  const remove = () => dispatch(removeSegment(segmentId))
  const toggleJoin = () => {
    dispatch(toggleSegmentJoining(segmentId))
    toggleAlert(dispatch, 'JOIN_INFO', JOIN_ALERT, editing)
  }
  const toggleSplit = () => {
    dispatch(toggleSegmentSpliting(segmentId))
    toggleAlert(dispatch, 'SPLIT_INFO', SPLIT_ALERT, editing)
  }
  const fit = () => dispatch(fitSegment(segmentId))
  const toggleDetails = () => dispatch(toggleSegmentPointDetails(segmentId))
  const updateFilter = (lower, higher) => dispatch(updateTimeFilterSegment(segmentId, lower, higher))
  const toggleTF = () => dispatch(toggleTimeFilter(segmentId))

  return (
    <div>
      <div style={{ width: '98%' }} className='control has-addons'>
        <ToolboxButton title='Delete track' icon='trash' onClick={remove} disabled={!start} />
        <ToolboxButton title='Center on map' icon='arrows-alt' onClick={fit} />
        <ToolboxButton title='Edit points' icon='pencil' onClick={toggleEdit} highlighted={editing} disabled={!start} />
        <ToolboxButton title='Split' icon='expand' onClick={toggleSplit} highlighted={spliting} disabled={!start} />
        <ToolboxButton title='Join' icon='compress' onClick={toggleJoin} highlighted={joining} disabled={!start} />
        <ToolboxButton title='Inspect points' icon='map-pin' onClick={toggleDetails} highlighted={pointDetails} />
        <ToolboxButton title='Filter points by time' icon='calendar' onClick={toggleTF} highlighted={showTimeFilter} disabled={!start} />

      </div>
      {
        showTimeFilter
          ? <TimeSlider start={start} initialStart={filterStart} end={end} initialEnd={filterEnd} onChange={updateFilter}/>
          : null
      }
    </div>
  )
}

const mapStateToProps = (state, { segmentId }) => {
  const segment = state.get('tracks').get('segments').get(segmentId)
  return {
    segmentId,
    start: segment.getStartTime(),
    end: segment.getStartTime(),
    editing: segment.get('editing'),
    spliting: segment.get('spliting'),
    joining: segment.get('joining'),
    pointDetails: segment.get('pointDetails'),
    showTimeFilter: segment.get('showTimeFilter'),
    filterStart: segment.get('timeFilter').get(0),
    filterEnd: segment.get('timeFilter').get(1)
  }
}

export default connect(mapStateToProps)(SegmentToolbox)
