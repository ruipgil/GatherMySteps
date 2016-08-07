import React from 'react'
import TrackName from 'containers/TrackName'
import TrackSegments from 'containers/TrackSegments'

const pluralize = (singular, count) => (count === 1 ? singular : singular + 's')

const Track = ({ dispatch, trackId, pointCount, segmentCount }) => {
  return (
    <div className='fade-in'>
      <div style={{fontSize: '1.5rem'}}>
        <TrackName trackId={trackId} />
      </div>
      <span style={{fontSize: '0.8rem', color: 'gray'}}>
        {segmentCount} {pluralize('segment', segmentCount)}, {pointCount} {pluralize('point', pointCount)}
      </span>
      <TrackSegments trackId={trackId} />
    </div>
  )
}

export default Track
