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
import FA from 'react-fontawesome'

const calculateDistance = (points) => {
  let l = points.count() - 2
  return points.map((p) => {
    return { latitude: p.lat, longitude: p.lon }
  }).reduce((prev, curr, i, arr) => {
    if (i < l) {
      return prev + haversine(curr, arr[i + 1], {unit: 'km'})
    } else {
      return prev
    }
  }, 0)
}

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
  // let metrics = calculateMetrics(points)
  let distance = metrics.totalDistance
  let avrgSpeed = metrics.averageVelocity
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
          <div className='x-btn' onClick={remove(id)}><FA name='trash' /></div>
          <div className='x-btn' onClick={fit(id)} ><FA name='arrows-alt' /></div>
          <div className='x-btn' onClick={toggleEdit(id)} style={{backgroundColor: editing ? '#ddd' : '#fff'}}><FA name='pencil' /></div>
          <div className='x-btn' onClick={toggleSplit(id)} style={{backgroundColor: spliting ? '#ddd' : '#fff'}}><FA name='expand' /></div>
          <div className='x-btn' onClick={toggleJoin(id)} style={{backgroundColor: joining ? '#ddd' : '#fff'}}><FA name='compress' /></div>
          <div className='x-btn' onClick={toggleDetails(id)} style={{backgroundColor: pointDetails ? '#ddd' : '#fff'}}><FA name='map-pin' /></div>
        </div>
      </li>
    </div>
    </div>
  )
}

export default SegmentRepresentation
