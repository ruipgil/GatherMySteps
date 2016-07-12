import React from 'react'
import SegmentRepresentation from './SegmentRepresentation.jsx'
import { downloadTrack, toggleTrackRenaming, updateTrackName } from '../actions/tracks'

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
              if (a.get('start').isSame(b.get('start'))) {
                return a.get('end').diff(b.get('end'))
              } else {
                return a.get('start').diff(b.get('start'))
              }
            })
          .map((s, i) => <SegmentRepresentation dispatch={dispatch} segment={s} key={i} />)
        }
      </ul>
    </div>
  )
}

export default TrackRepresentation
