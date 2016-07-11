import React from 'react'

const flexAlignStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 10px'
}

const DetailPopup = ({ lat, lon, time, distance, velocity, i, onMove, count, editable, onSave, onCancel }) => {
  const displayPrev = i !== 0
  const displayNext = (i + 1) < count
  const styleLeft = Object.assign({}, flexAlignStyle, { opacity: displayPrev ? 1 : 0.5 })
  const styleRight = Object.assign({}, flexAlignStyle, { opacity: displayNext ? 1 : 0.5 })

  let data
  let buttons
  if (editable) {
    const txtbxStyle = {}
    data = [
      <div>Lat: <input defaultValue={lat} style={txtbxStyle} /></div>,
      <div>Lon: <input defaultValue={lon} style={txtbxStyle} /></div>,
      <div>Time: <input type='datetime-local' defaultValue={time.local().format('YYYY-MM-DDThh:mm')} /></div>,
      <div><strong>{(distance * 1000).toFixed(3)}</strong>m at <strong>{velocity.toFixed(3)}</strong>km/h</div>
    ]
    buttons = [
      <a onClick={onCancel}>Cancel</a>,
      <a onClick={onSave}>Save</a>
    ]
  } else {
    data = [
      <div>Lat: <strong>{lat}</strong> Lon: <strong>{lon}</strong></div>,
      <div>Time: <strong>{time.format('dddd, MMMM Do YYYY, HH:mm:ss')}</strong></div>,
      <div><strong>{(distance * 1000).toFixed(3)}</strong>m at <strong>{velocity.toFixed(3)}</strong>km/h</div>
    ]
    buttons = [
      <a>Edit</a>
    ]
  }

  return (
    <div className='is-flex'>
      <span style={styleLeft} onClick={() => (displayPrev ? onMove(i - 1) : null)} className='clickable'>
        <i className='fa fa-chevron-left' />
      </span>
      <span>
        <div>#<strong>{i + 1}</strong></div>
        { data }
        <div>
          { buttons }
        </div>
      </span>
      <span style={styleRight} onClick={() => (displayNext ? onMove(i + 1) : null)} className='clickable'>
        <i className='fa fa-chevron-right' />
      </span>
    </div>
  )
}

export default DetailPopup
