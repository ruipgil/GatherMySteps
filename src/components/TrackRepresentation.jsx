import React from 'react'
import exportGPX from '../actions/exportGPX'
import SegmentRepresentation from './SegmentRepresentation.jsx'
import toggleTrackRenaming from '../actions/toggleTrackRenaming'
import updateTrackName from '../actions/updateTrackName'

const TrackRepresentation = ({ dispatch, track }) => {
  const { name, segments, renaming, id } = track
  const totalPoints = segments.reduce((prev, segment) => {
    return prev + segment.points.length
  }, 0)
  const onDownload = () => exportGPX(track)
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
      <div>
        <input type='text' value={name} onChange={updateName} style={{ width: '70%' }} />
        <button onClick={toggleEditing} style={{ width: '20%' }}>DONE</button>
      </div>
    )
  } else {
    title = (
      <div>
        <div className='float-right clickable' style={{ width: '16px', height: '16px' }} onClick={onDownload}><img style={{ width: '16px', height: '16px' }} src='/arrows.svg' alt='Download' title='Download' /></div>
        <div onClick={toggleEditing}>{name}</div>
      </div>
    )
  }

  return (
    <div style={{paddingLeft: '2%'}} >
      <div style={{fontSize: '1.5rem'}}>
        {title}
      </div>
      <span style={{fontSize: '0.8rem', color: 'gray'}}>{segments.length} segment{segments.length === 1 ? '' : 's'}, {totalPoints} points</span>
      <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
        {
          segments.map((s, i) => <SegmentRepresentation dispatch={dispatch} segment={s} key={i} />)
        }
      </ul>
    </div>
  )
}

export default TrackRepresentation
