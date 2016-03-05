import React from 'react'
import { connect } from 'react-redux'

let ProgressBar = ({ state, children }) => {
  const none = {}
  const active = { className: 'active' }
  return (
    <div className='status-container'>
      <ul className='progressbar'>
        <li { ...(state >= 0 ? active : none) }>Preview</li>
        <li { ...(state >= 1 ? active : none) }>Adjust</li>
        <li { ...(state >= 2 ? active : none) }>Annotate</li>
        <li { ...(state >= 3 ? active : none) }>Done</li>
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
