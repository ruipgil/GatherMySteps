import React from 'react'
import { connect } from 'react-redux'
import { addAlert, toggleRemainingTracks } from 'actions/ui'
import { hideCanonical, clearAll, downloadAll, showHideAll } from 'actions/tracks'
import {
  skipDay,
  nextStep,
  previousStep,
  bulkProcess,
  loadLIFE,
  reloadQueue
} from 'actions/progress'
import BulkButtons from 'components/BulkButtons'
import NavigationButtons from 'components/NavigationButtons'
import MultipleActionsButtons from 'components/MultipleActionsButtons'
import PaneDrawer from 'components/PaneDrawer'
import PaneContent from 'components/PaneContent'

const errorHandler = (dispatch, err, modifier) => {
  dispatch(addAlert(
    <div>
      <div>There was an error</div>
      <div>{ process.env.NODE_ENV === 'development' ? err.stack.split('\n').map((e) => <div>{e}</div>) : '' }</div>
    </div>
  ), 'error', 20)
  console.error(err.stack)
  modifier('is-danger')
  setTimeout(() => modifier(''), 2000)
}

let SidePane = ({ dispatch, stage, canProceed, remainingCount, showList, segmentsCount, canonical, isLoadingNext, isLoadingPrevious }) => {
  const style = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }
  const onShowHide = () => dispatch(showHideAll())
  const onDownload = () => dispatch(downloadAll())
  const onClear = () => dispatch(clearAll())
  const toggleList = () => dispatch(toggleRemainingTracks())
  const onPrevious = (e, modifier) => {
    modifier('is-loading')
    dispatch(previousStep())
    .then(() => modifier())
    .catch((e) => errorHandler(dispatch, e, modifier))
  }
  const onSkip = (e, modifier) => {
    modifier('is-loading')
    dispatch(skipDay())
    .then(() => modifier())
    .catch((e) => errorHandler(dispatch, e, modifier))
  }
  const onNext = (e, modifier) => {
    modifier('is-loading')
    dispatch(nextStep())
    .then(() => modifier())
    .catch((e) => errorHandler(dispatch, e, modifier))
  }
  const onBulkClick = (e, modifier) => {
    modifier('is-loading')
    dispatch(bulkProcess())
      .then(() => modifier())
  }
  const onLifeRead = (text, modifier) => {
    modifier('is-loading')
    dispatch(loadLIFE(text))
      .then(() => {
        modifier('is-success', (c) => c !== 'is-warning')
        setTimeout(() => modifier(), 2000)
      })
      .catch((err) => {
        console.error(err)
        modifier('is-danger', (c) => c !== 'is-warning')
        setTimeout(() => modifier(), 2000)
      })
  }

  let buttons
  if (canonical) {
    buttons = (
      <a className='button is-primary' onClick={() => dispatch(hideCanonical())} style={{ margin: 'auto' }}>Done</a>
    )
  } else {
    if (showList) {
      buttons = <BulkButtons onBulkClick={onBulkClick} onLifeRead={onLifeRead} />
    } else {
      buttons = (
        <NavigationButtons
          isFinal={stage === 2}
          canSkip={stage === 0 && remainingCount > 1}
          isLoadingNext={isLoadingNext}
          isLoadingPrevious={isLoadingPrevious}
          canProceed={canProceed} canPrevious={stage !== 0}
          onPrevious={onPrevious} onSkip={onSkip} onNext={onNext}
        />
      )
    }
  }
  return (
    <div id='details' className='container' style={style}>
      <PaneContent showList={showList} stage={stage} />

      <MultipleActionsButtons
        onShowHide={onShowHide} onDownload={onDownload} onClear={onClear}
        segmentsCount={segmentsCount} stage={stage} />

      <div style={{ marginTop: '0.5rem' }}>
        <div className='is-gapless' style={{ marginBottom: 0 }}>
          { buttons }
        </div>
        <PaneDrawer onClick={toggleList} remainingCount={remainingCount} showList={showList} />
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    stage: state.get('progress').get('step'),
    canonical: state.get('tracks').get('canonical'),
    showList: state.get('ui').get('showRemainingTracks'),
    remainingCount: state.get('progress').get('remainingTracks').count(),
    canProceed: state.get('tracks').get('tracks').count() > 0,
    segmentsCount: state.get('tracks').get('segments').count(),
    isLoadingNext: state.get('ui').get('loading').has('continue-button'),
    isLoadingPrevious: state.get('ui').get('loading').has('previous-button')
  }
}

export default connect(mapStateToProps)(SidePane)
