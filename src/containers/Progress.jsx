import React from 'react'
import { ADJUST_STAGE, PREVIEW_STAGE, ANNOTATE_STAGE } from '../constants'
import { connect } from 'react-redux'
import TrackList from './TrackList.jsx'
import SemanticEditor from '../components/SemanticEditor.jsx'
import { nextStep } from '../actions/progress'

let Progress = ({ dispatch, stage, canProceed }) => {
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
    <div className='container is-flex' style={{ height: '100%', flexDirection: 'column' }}>
      <Pane className='is-flexgrow' />
      <div className='columns'>
        <div className='column is-text-centered'>
          <a className={'button is-warning' + ((stage === 0) ? ' is-disabled' : '')} onClick={onPrevious}>
            <i className='fa fa-chevron-left' />
            Previous
          </a>
        </div>
        <div className='column is-text-centered'>
          <a className={'button is-success' + (!canProceed ? ' is-disabled' : '')} onClick={onNext}>
            Continue
            <i className='fa fa-chevron-right' />
          </a>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    stage: state.get('progress'),
    canProceed: state.get('tracks').get('tracks').count() > 0
  }
}

Progress = connect(mapStateToProps)(Progress)

export default Progress
