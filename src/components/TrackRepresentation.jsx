import React from 'react'
import downloadTrack from '../actions/downloadTrack'
import SegmentRepresentation from './SegmentRepresentation.jsx'

const TrackRepresentation = ({ dispatch, track }) => {
  const { name, segments } = track
  return (
    <div style={{paddingLeft: '2%'}} >
      <div style={{fontSize: '1.5rem'}}>{name} <span style={{fontSize: '0.8rem', color: 'gray'}}>{segments.length} segment{segments.length === 1 ? '' : 's'}</span></div>
      <div onClick={() => dispatch(downloadTrack(track))}>Download</div>
      <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
        {
          segments.map((s, i) => <SegmentRepresentation dispatch={dispatch} segment={s} key={i} />)
        }
      </ul>
    </div>
  )
}

export default TrackRepresentation
