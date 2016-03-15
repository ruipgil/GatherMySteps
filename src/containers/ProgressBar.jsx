import React from 'react'
import { connect } from 'react-redux'

let ProgressBar = ({ state, children }) => {
  const none = {}
  const active = { className: 'active' }
  const width = '25%'
  return (
    <div className='status-container'>
      <ul className='progressbar'>
        <li { ...(state >= 0 ? active : none) } style={{width}}>Preview</li>
        <li { ...(state >= 1 ? active : none) } style={{width}}>Adjust</li>
        <li { ...(state >= 2 ? active : none) } style={{width}}>Annotate</li>
        <li { ...(state >= 3 ? active : none) } style={{width}}>Done</li>
      </ul>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    state: state.get('progress') || 0
  }
}

ProgressBar = connect(mapStateToProps)(ProgressBar)

export default ProgressBar
