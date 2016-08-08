import React from 'react'
import { ANNOTATE_STAGE } from 'constants'

const MultipleActionsButtons = ({ onShowHide, onDownload, onClear, segmentsCount, stage }) => {
  if (segmentsCount > 1 && stage !== ANNOTATE_STAGE) {
    return (
      <div className='control-v has-addons fade-in' style={{ width: '30px', position: 'fixed', left: '19.6%', top: '100px' }}>
        <a className='button icon-button column is-gapless is-text-centered' onClick={onShowHide} title='Toggle all'><i className='fa fa-eye-slash' /></a>
        <a className='button icon-button column is-gapless is-text-centered' onClick={onDownload} title='Download all'><i className='fa fa-download' /></a>
        <a className='button icon-button column is-gapless is-text-centered' onClick={onClear} title='Delete all'><i className='fa fa-trash' /></a>
      </div>
    )
  } else {
    return <span></span>
  }
}

export default MultipleActionsButtons
