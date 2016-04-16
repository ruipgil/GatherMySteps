import React from 'react'
import {
  toggleSegmentDisplay
} from '../actions/segments'

import SegmentToolbox from 'components/SegmentToolbox'

const style = {
  fontSize: '1rem',
  color: 'gray',
  margin: '0.1rem 0'
}

const SegmentRepresentation = ({ dispatch, segment }) => {
  const id = segment.get('id')
  const points = segment.get('points')
  const start = segment.get('start')
  const end = segment.get('end')
  const display = segment.get('display')
  const color = segment.get('color')
  const metrics = segment.get('metrics').toJS()

  const toggleTrack = (segmentIndex) => {
    return () => dispatch(toggleSegmentDisplay(segmentIndex))
  }

  let distance = metrics.totalDistance
  let avrgSpeed = metrics.averageVelocity

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

        <SegmentToolbox segment={segment} dispatch={dispatch} />
      </li>
    </div>
    </div>
  )
}

export default SegmentRepresentation
