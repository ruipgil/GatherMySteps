import React from 'react'
import { connect } from 'react-redux'
import TrackName from 'containers/TrackName'
import TrackSegments from 'containers/TrackSegments'

const pluralize = (singular, count) => (count === 1 ? singular : singular + 's')

const Track = ({ track, pointCount, segmentCount, onRename, onDownload, onToggleRemainingTracks, remaining }) => {
  return (
    <div className='fade-in'>
      <div style={{fontSize: '1.5rem'}}>
        <TrackName
          track={track}
          onRename={onRename}
          onDownload={onDownload}
          editable={!!process.env.BUILD_GPX}
          onClick={onToggleRemainingTracks}
          daysLeft={remaining} />
      </div>
      <span style={{fontSize: '0.8rem', color: 'gray'}}>
        {segmentCount} {pluralize('segment', segmentCount)}, {pointCount} {pluralize('point', pointCount)}
      </span>
      <TrackSegments trackId={track.get('id')} />
    </div>
  )
}

const mapStateToProps = (state, { trackId, ...props }) => {
  const track = state.get('tracks').get('tracks').get(trackId)
  const getSegment = (segmentId) => state.get('tracks').get('segments').get(segmentId)
  return {
    track,
    pointCount: track.get('segments').reduce((x, segmentId) => x + getSegment(segmentId).pointCount(), 0),
    segmentCount: track.get('segments').count(),
    ...props
  }
}

export default connect(mapStateToProps)(Track)
