import React from 'react'

const ProgressRuler = ({ style }) => {
  const _style = { flexGrow: 2, display: 'inline-block' }
  return (
    <div style={_style}>
      <div style={{ backgroundColor: 'white', width: '110%', height: '5px', marginLeft: '-5%', ...style }}>
      </div>
    </div>
  )
}

export default ProgressRuler
