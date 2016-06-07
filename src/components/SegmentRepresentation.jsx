import React from 'react'
import {
  toggleSegmentDisplay
} from '../actions/segments'
import { centerMap } from '../actions/ui'

import SegmentToolbox from 'components/SegmentToolbox'

const style = {
  fontSize: '0.8rem',
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

  const centerOnPoint = (index) => {
    return (e) => {
      e.stopPropagation()
      dispatch(centerMap(points.get(index).get('lat'), points.get(index).get('lon')))
    }
  }

  return (
    <div className='slide-from-top-fade-in'>
      <div>
        <li style={{borderLeft: '10px solid ' + color, paddingLeft: '2%', opacity: display ? 1 : 0.5, cursor: 'pointer'}} >
          <div onClick={toggleTrack(id)}>
            <div style={{ fontSize: '0.8rem', textAlign: 'center', paddingTop: '1rem' }} >
              <i className='fa fa-calendar-o' style={{ fontSize: '0.8rem', verticalAlign: 'baseline' }} /> {end.fromNow()}
            </div>
            <div className='' style={{ display: 'flex' }}>
              <div className='date-from' onClick={centerOnPoint(0)}>
                <div style={{ fontSize: '0.7rem', color: '#aaa' }}>start</div>
                <div>{start.format('L')}</div>
                <div>{start.format('LT')}</div>
              </div>
              <div className='date-to' onClick={centerOnPoint(-1)} >
                <div style={{ fontSize: '0.7rem', color: '#aaa' }}>end</div>
                <div>{end.format('L')}</div>
                <div>{end.format('LT')}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>
              <i className='fa fa-clock-o' style={{ fontSize: '0.8rem', verticalAlign: 'baseline' }} /> {start.to(end, true)}
            </div>

            <div style={style}>{points.count()} points, { distance.toFixed(2) } km at { avrgSpeed.toFixed(2) } km/h</div>
          </div>

          <SegmentToolbox segment={segment} dispatch={dispatch} />
        </li>
      </div>
    </div>
  )
}

export default SegmentRepresentation
