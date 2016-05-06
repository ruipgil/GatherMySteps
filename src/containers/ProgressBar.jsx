import React from 'react'
import { connect } from 'react-redux'

let ProgressBar = ({ state, children }) => {
  const none = {}
  const active = { className: 'active' }
  const highlight = { className: 'hl' }
  const TIP_SIZE = 0
  const width = ((100 - TIP_SIZE) / 5) + '%'

  const selector = (current, index) => {
    if (current === index) {
      return highlight
    } else if (current > index) {
      return active
    } else {
      return none
    }
  }
  return (
    <div>
    <div>
      <ul className='progressbar'>
        <li { ...active } style={{ width }}></li>
        <li { ...selector(state, 0) } style={{width}}></li>
        <li { ...selector(state, 1) } style={{width}}></li>
        <li { ...selector(state, 2) } style={{width}}></li>
        <li { ...none } style={{width}}></li>
      </ul>
    </div>
    <div className='pg-text'>
      <span { ...selector(state, 0) }>Preview</span>
      <span { ...selector(state, 1) }>Adjust</span>
      <span { ...selector(state, 2) }>Annotate</span>
    </div>
  </div>

  )
}

const mapStateToProps = (state) => {
  return {
    state: state.get('progress').get('step') || 0
  }
}

ProgressBar = connect(mapStateToProps)(ProgressBar)

export default ProgressBar
