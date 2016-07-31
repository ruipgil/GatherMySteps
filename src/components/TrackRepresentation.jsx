import React from 'react'
import SegmentRepresentation from './SegmentRepresentation.jsx'
import {
  downloadTrack,
  toggleTrackRenaming,
  updateTrackName
} from 'actions/tracks'
import {
  addNewSegment
} from 'actions/segments'

const segmentStartTime = (segment) => {
  return segment.get('points').get(0).get('time')
}

const segmentEndTime = (segment) => {
  return segment.get('points').get(-1).get('time')
}

const TrackRepresentation = ({ dispatch, track, segments }) => {
  // const { name, segments, renaming, id } = track
  const id = track.get('id')
  const name = track.get('name')
  const renaming = track.get('renaming')

  const totalPoints = segments.reduce((prev, segment) => {
    return prev + segment.get('points').count()
  }, 0)
  const onDownload = () => dispatch(downloadTrack(id))
  const updateName = (e) => {
    if (e.type) {
      const val = e.target.value
      dispatch(updateTrackName(id, val))
    }
  }
  const toggleEditing = () => dispatch(toggleTrackRenaming(id))

  let title
  if (renaming) {
    title = (
      <div className='control is-grouped'>
        <input className='input' type='text' value={name} onChange={updateName} />
        <a className='button is-info' onClick={toggleEditing}>
          <i className='fa fa-check' />
        </a>
      </div>
    )
  } else {
    title = (
      <div>
        {
          process.env.BUILD_GPX
          ? (
            <div className='float-right clickable icon' onClick={onDownload}>
              <i className='fa fa-download' />
            </div>
            )
          : null
        }
        <div onClick={toggleEditing}>{name}</div>
      </div>
    )
  }

  return (
    <div className='fade-in'>
      <div style={{fontSize: '1.5rem'}}>
        {title}
      </div>
      <span style={{fontSize: '0.8rem', color: 'gray'}}>{segments.count()} segment{segments.count() === 1 ? '' : 's'}, {totalPoints} points</span>
      <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
        {
          segments
            .sort((a, b) => {
              if (segmentStartTime(a).isSame(segmentStartTime(b))) {
                return segmentEndTime(a).diff(segmentEndTime(b))
              } else {
                return segmentStartTime(a).diff(segmentStartTime(b))
              }
            })
          .map((s, i) => <SegmentRepresentation dispatch={dispatch} segment={s} key={i} />)
        }

        <div style={{ borderLeft: '4px dotted #aaa', marginLeft: '3px', paddingLeft: '6px' }} className='slide-from-top-fade-in' >
          <a style={{
            borderStyle: 'dashed',
            width: '100%',
            color: 'gray',
            padding: '5px',
            margin: '5px 0 6px 0px'
          }} className='button is-small' onClick={() => dispatch(addNewSegment(id))}>
            <span className='icon is-small'>
              <i className='fa fa-plus' />
            </span>
            new segment
          </a>
        </div>
      </ul>
    </div>
  )
}

export default TrackRepresentation
