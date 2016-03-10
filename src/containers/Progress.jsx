import React from 'react'
import { ADJUST_STAGE, PREVIEW_STAGE, ANNOTATE_STAGE } from '../constants'
import { connect } from 'react-redux'
import TrackList from './TrackList.jsx'
import SemanticEditor from '../components/SemanticEditor.jsx'
import { nextStep } from '../actions/progress'

let Progress = ({ dispatch, stage }) => {
  let Pane
  switch (stage) {
    case ADJUST_STAGE:
    case PREVIEW_STAGE:
      Pane = TrackList
      break
    case ANNOTATE_STAGE:
      Pane = SemanticEditor
      break
  }

  const onPrevious = () => {}
  const onNext = () => dispatch(nextStep())

  return (
    <div>
      <Pane />
      <div>
        <div onClick={onPrevious} className='previousBtn'>
          Previous
        </div>
        <div onClick={onNext} className='nextBtn'>
          Next
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    stage: state.get('progress')
  }
}

Progress = connect(mapStateToProps)(Progress)

export default Progress
