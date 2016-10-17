import React from 'react'
import { connect } from 'react-redux'
import { addNewSegment } from 'actions/segments'
import Segment from 'containers/Segment'
import { updateBounds } from 'actions/map'
import { computeBounds } from 'records'

const newSegmentBoxStyle = {
  borderStyle: 'dashed',
  width: '100%',
  color: 'gray',
  padding: '5px',
  margin: '5px 0 6px 0px'
}

const newSegmentParentStyle = {
  borderLeft: '4px dotted #aaa',
  marginLeft: '3px',
  paddingLeft: '6px'
}

const TrackSegments = ({ dispatch, segments, track }) => {
  const newSegment = () => dispatch(addNewSegment(track.get('id')))
  return (
    <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
      {
        segments.map((segment, i) => {
          let dt = null
          const nowTime = segment.getStartTime()
          const prevSegment = segments.get(i - 1)
          const prevTime = prevSegment.getStartTime()
          if (i > 0 && nowTime && prevTime) {
            const dtVal = nowTime.from(prevTime, true)
            const action = () => dispatch(updateBounds(computeBounds([segment.get('points').get(0), prevSegment.get('points').get(-1)]).scale(1.4)))
            const dx = segment.get('points').get(0).distance(prevSegment.get('points').get(-1)) * 1000

            dt = (
              <div style={{ ...newSegmentParentStyle, paddingTop: '2px', paddingBottom: '2px' }} className='slide-from-top-fade-in' >
                <a style={{ fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.7, color: '#999' }} onClick={action}>
                  { dtVal } and { dx.toFixed(0) } meters apart
                </a>
              </div>
            )
          }
          return (
            <div>
              { dt }
              <Segment segment={segment} key={i} />
            </div>
          )
        })
      }

      <div style={newSegmentParentStyle} className='slide-from-top-fade-in' >
        <a style={newSegmentBoxStyle} className='button is-small' onClick={newSegment}>
          <span className='icon is-small'>
            <i className='fa fa-plus' />
          </span>
          new segment
        </a>
      </div>
    </ul>
  )
}

const mapStateToProps = (state, { trackId }) => {
  const track = state.get('tracks').get('tracks').get(trackId)
  const segments = track
    .get('segments').toList()
    .map((segmentId) => state.get('tracks').get('segments').get(segmentId))
    .sort((a, b) => {
      if (a.getStartTime() && b.getStartTime()) {
        if (a.getStartTime().isSame(b.getStartTime())) {
          return a.getEndTime().diff(b.getEndTime())
        } else {
          return a.getStartTime().diff(b.getStartTime())
        }
      } else {
        return
      }
    })

  return {
    track,
    segments
  }
}

export default connect(mapStateToProps)(TrackSegments)
