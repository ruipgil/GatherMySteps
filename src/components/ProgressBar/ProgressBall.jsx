import React from 'react'

const DEFAULT_STYLE = {
  borderRadius: '50%'
}

const ProgressBall = ({ style }) => {
  const stl = {
    ...style,
    ...DEFAULT_STYLE
  }

  return (
    <div style={stl}></div>
  )
}

export default ProgressBall
