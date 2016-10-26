import React from 'react'

const blockStyle = {
  marginTop: '10px'
}
const blockHeader = {
  fontSize: '1.4rem'
}

const SectionBlock = ({ name, children }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h1 style={blockHeader}> {name} </h1>
      <div style={blockStyle}>
        {children}
      </div>
    </div>
  )
}

export default SectionBlock
