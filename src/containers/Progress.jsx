import React from 'react'
import { ADJUST_STAGE, PREVIEW_STAGE, ANNOTATE_STAGE } from '../constants'
import { connect } from 'react-redux'
import TrackList from './TrackList.jsx'
import AsyncButton from 'components/AsyncButton'
import SemanticEditor from '../components/SemanticEditor.jsx'
import { nextStep, previousStep } from '../actions/progress'
import { toggleRemainingTracks } from 'actions/ui'
import {
  clearAll,
  downloadAll,
  showHideAll
} from 'actions/tracks'

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

  const errorHandler = (err, modifier) => {
    dispatch(addAlert(
      <div>
        <div>There was an error</div>
        <div>{ process.env.NODE_ENV === 'development' ? err.stack.split('\n').map((e) => <div>{e}</div>) : '' }</div>
      </div>
    ), 'error', 20)
    console.error(err.stack)
    modifier('is-danger')
    setTimeout(() => modifier(), 2000)
  }

  const onPrevious = (e, modifier) => {
    modifier('is-loading')
    dispatch(previousStep())
    .then(() => modifier())
    .catch((e) => errorHandler(e, modifier))
  }
  const onNext = (e, modifier) => {
    modifier('is-loading')
    dispatch(nextStep())
    .then(() => modifier())
    .catch((e) => errorHandler(e, modifier))
  }

  const remainingMessage = (n) => {
    switch (n) {
      case 0:
        return (
          <span>
            <i className='fa fa-check fa-fw fa-ih' /> This is the last days to process
          </span>
        )
      case 1:
        return (
          <span>
            <i className='fa fa-ellipsis-h fa-ih' /> There is one more day to process
          </span>
        )
      default:
        return (
          <span>
            <i className='fa fa-ellipsis-h fa-ih' /> { n } Days to process
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
    let style = { overflowY: 'auto' }
    if (stage === ANNOTATE_STAGE) {
      style = {
        ...style,
        overflowX: 'visible',
        // resize: 'horizontal',
        paddingTop: '2px',
        // maxWidth: '500px',
        minWidth: '100%',
        // width: '400px',
        borderRadius: '0px 3px 3px 0px',
        backgroundColor: 'white'
      }
    }

    toShow = (
      <div className='is-flexgrow is-flex' style={style} >
        <Pane className='is-flexgrow' width='100%' />
      </div>
    )
  }

  const nav = (
    <div style={{ marginTop: '1.1rem' }}>
      <div className='columns is-gapless'>
        <a className='button icon-button column is-gapless is-text-centered' onClick={() => dispatch(showHideAll())} title='Toggle all'><i className='fa fa-eye-slash' /></a>
        <a className='button icon-button column is-gapless is-text-centered' onClick={() => dispatch(downloadAll())} title='Download all'><i className='fa fa-download' /></a>
        <a className='button icon-button column is-gapless is-text-centered' onClick={() => dispatch(clearAll())} title='Delete all'><i className='fa fa-trash' /></a>
      </div>
      <div className='columns is-gapless' style={{ marginBottom: 0 }}>
        <span className='column is-half is-gapless is-text-centered'>
          <AsyncButton disabled={stage === 0} className={'is-warning'} onClick={onPrevious}>
            <i className='fa fa-chevron-left' />
            Previous
          </AsyncButton>
        </span>
        <span className='column is-half is-gapless is-text-centered'>
          <AsyncButton disabled={!canProceed} className={'is-success'} onClick={onNext}>
            Continue
            <i className='fa fa-chevron-right' />
          </AsyncButton>
        </span>
      </div>
      <div style={{ color: 'gray', textAlign: 'center', fontSize: '0.9rem' }} className='clickable' onClick={() => dispatch(toggleRemainingTracks())}>
        { remainingMessage(remaining.count()) }
      </div>
    </div>
  )
  return (
    <div id='details' className='container' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
