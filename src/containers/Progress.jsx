import React from 'react'
import { ADJUST_STAGE, PREVIEW_STAGE, ANNOTATE_STAGE } from '../constants'
import { connect } from 'react-redux'
import TrackList from './TrackList.jsx'
import AsyncButton from 'components/AsyncButton'
import SemanticEditor from '../components/SemanticEditor.jsx'
import {
  nextStep,
  previousStep,
  bulkProcess
} from '../actions/progress'
import DaysLeft from 'containers/DaysLeft'
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
            <i className='fa fa-check fa-fw fa-ih' /> There are no days left to process
          </span>
        )
      case 1:
        return (
          <span>
            <i className='fa fa-check fa-fw fa-ih' /> This is the last day to process
          </span>
        )
      case 2:
        return (
          <span>
            <i className='fa fa-ellipsis-h fa-ih' /> There is one more day to process
          </span>
        )
      default:
        return (
          <span>
            <i className='fa fa-ellipsis-h fa-ih' /> { n } more days to process
          </span>
        )
    }
  }

  let subNav = null
  let toShow
  let detailsLabel

  const bulkNav = (
    <div style={{ margin: 'auto' }}>
      <span className='is-gapless has-text-centered'>
        <AsyncButton className={'is-warning'} onClick={(e, modifier) => {
          modifier('is-loading')
          dispatch(bulkProcess())
            .then(() => modifier())
        }}>
          Bulk process all tracks
        </AsyncButton>
      </span>
    </div>
  )
  const navNav = (
    <div>
      <span className='column is-half is-gapless has-text-centered'>
        <AsyncButton disabled={stage === 0} className={'is-warning'} onClick={onPrevious}>
          <i className='fa fa-chevron-left' />
          Previous
        </AsyncButton>
      </span>
      <span className='column is-half is-gapless has-text-centered'>
        <AsyncButton disabled={!canProceed} className={'is-success'} onClick={onNext}>
          Continue
          <i className='fa fa-chevron-right' />
        </AsyncButton>
      </span>
    </div>
  )
  if (showList) {
    subNav = bulkNav
    toShow = <DaysLeft style={{ flexGrow: 1, overflowY: 'auto' }}/>
    detailsLabel = (
      <div style={{ color: 'gray', textAlign: 'center', fontSize: '0.9rem' }} className='clickable' onClick={() => dispatch(toggleRemainingTracks())}>
        <i className='fa fa-pencil fa-fw fa-ih' />Edit tracks of the current day
      </div>
    )

    // toShow = (
    //   <ul className='is-flexgrow slide-from-top-fade-in' style={{ overflowY: 'auto' }}>
    //     {
    //       remaining.map((track) => {
    //         return (
    //           <li>
    //             { track.get('name') }
    //           </li>
    //         )
    //       })
    //     }
    //   </ul>
    // )
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
    detailsLabel = (
      <div style={{ color: 'gray', textAlign: 'center', fontSize: '0.9rem' }} className='clickable' onClick={() => dispatch(toggleRemainingTracks())}>
        { remainingMessage(remaining.count()) }
      </div>
    )
    subNav = navNav
  }

  const multipleActions = (
    <div className='columns is-gapless'>
      <a className='button icon-button column is-gapless is-text-centered' onClick={() => dispatch(showHideAll())} title='Toggle all'><i className='fa fa-eye-slash' /></a>
      <a className='button icon-button column is-gapless is-text-centered' onClick={() => dispatch(downloadAll())} title='Download all'><i className='fa fa-download' /></a>
      <a className='button icon-button column is-gapless is-text-centered' onClick={() => dispatch(clearAll())} title='Delete all'><i className='fa fa-trash' /></a>
    </div>
  )

  let nav = (
    <div style={{ marginTop: '0.5rem' }}>
      { process.env.BUILD_GPX ? multipleActions : null }
      <div className='columns is-gapless' style={{ marginBottom: 0 }}>
        { subNav }
      </div>
      { detailsLabel }
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
