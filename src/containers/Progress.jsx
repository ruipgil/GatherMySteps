import React from 'react'
import { ADJUST_STAGE, PREVIEW_STAGE, ANNOTATE_STAGE } from '../constants'
import { connect } from 'react-redux'
import TrackList from './TrackList.jsx'
import AsyncButton from 'components/AsyncButton'
import SemanticEditor from '../components/SemanticEditor.jsx'
import { nextStep, previousStep } from '../actions/progress'
import { toggleRemainingTracks } from 'actions/ui'

import { addAlert } from 'actions/ui'

let Progress = ({ dispatch, stage, canProceed, remaining, showList }) => {
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

  const onPrevious = (e, modifier) => {
    modifier('is-loading')
    dispatch(previousStep())
    .then(() => modifier())
    .catch((err) => {
      dispatch(addAlert('There was an error'))
      console.error(err)
      modifier('is-danger')
      setTimeout(() => modifier(), 2000)
    })
  }
  const onNext = (e, modifier) => {
    modifier('is-loading')
    dispatch(nextStep())
    .then(() => modifier())
    .catch((err) => {
      dispatch(addAlert('There was an error'))
      console.error(err)
      modifier('is-danger')
      setTimeout(() => modifier(), 2000)
    })
  }

  const remainingMessage = (n) => {
    switch (n) {
      case 0:
        return (
          <span>
            <i className='fa fa-check fa-fw fa-ih' /> All tracks are processed
          </span>
        )
      case 1:
        return (
          <span>
            <i className='fa fa-ellipsis-h fa-ih' /> One track left
          </span>
        )
      default:
        return (
          <span>
            <i className='fa fa-ellipsis-h fa-ih' /> { n } tracks left
          </span>
        )
    }
  }

  let toShow
  if (showList) {
    toShow = (
      <ul className='is-flexgrow slide-from-top-fade-in' style={{ overflowY: 'auto' }}>
        {
          remaining.map((track) => {
            return (
              <li>
                { track.get('name') }
              </li>
            )
          })
        }
      </ul>
    )
  } else {
    toShow = (
      <div className='is-flexgrow is-flex' style={{ overflowY: 'auto' }} >
        <Pane className='is-flexgrow' />
      </div>
    )
  }

  const nav = (
    <div style={{ marginTop: '0.5rem' }}>
      <span className='column is-half is-gapless is-text-centered'>
        <AsyncButton disabled={stage === 0} className={'is-warning'} onClick={onPrevious}>
          <i className='fa fa-chevron-left' />
          Previous
        </AsyncButton>
      </span>
      <span className='column is-half is-text-centered'>
        <AsyncButton disabled={!canProceed} className={'is-success'} onClick={onNext}>
          Continue
          <i className='fa fa-chevron-right' />
        </AsyncButton>
      </span>
      <div style={{ color: 'gray', textAlign: 'center', fontSize: '0.9rem' }} className='clickable' onClick={() => dispatch(toggleRemainingTracks())}>
        { remainingMessage(remaining.count()) }
      </div>
    </div>
  )
  return (
    <div className='container' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      { toShow }
      { process.env.BUILD_GPX ? null : nav }
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    stage: state.get('progress').get('step'),
    showList: state.get('ui').get('showRemainingTracks'),
    remaining: state.get('progress').get('remainingTracks'),
    canProceed: state.get('tracks').get('tracks').count() > 0
  }
}

Progress = connect(mapStateToProps)(Progress)

export default Progress
