import React from 'react'
import AsyncButton from 'components/AsyncButton'

const buttonStyle = {
  flex: 1,
  flexGrow: 1
}

const NavigationButtons = ({ isLoadingPrevious, isLoadingNext, canPrevious, onPrevious, canSkip, onSkip, onNext, canProceed, isFinal }) => {
  const prevClassName = 'is-warning' + (isLoadingPrevious ? ' is-loading' : '')
  const nextClassName = 'is-success' + (isLoadingNext ? ' is-loading' : '')
  const previous = (
    <AsyncButton style={buttonStyle} className={prevClassName} onClick={onPrevious} disabled={!canPrevious || isLoadingPrevious}>
      <i className='fa fa-chevron-left' style={{ float: 'left', marginRight: '1rem' }} /> Previous
    </AsyncButton>
  )
  const skip = (
    <AsyncButton style={buttonStyle} className={prevClassName} onClick={onSkip} disabled={!canSkip || isLoadingPrevious}>
      Skip day
      <i className='fa fa-angle-double-right' style={{ float: 'right', marginLeft: '1rem' }} />
    </AsyncButton>
  )
  const contn = (
    <AsyncButton style={buttonStyle} disabled={!canProceed} className={nextClassName} onClick={onNext} disabled={isLoadingNext}>
      Continue <i className='fa fa-chevron-right' style={{ float: 'right', marginLeft: '1rem' }} />
    </AsyncButton>
  )
  const fnal = (
    <AsyncButton style={buttonStyle} disabled={!canProceed} className={nextClassName} onClick={onNext} disabled={isLoadingNext}>
      Save <i className='fa fa-check' style={{ float: 'right', marginLeft: '1rem' }} />
    </AsyncButton>
  )
  return (
    <div style={{ display: 'flex' }} className='control has-addons'>
      { canPrevious ? previous : skip }
      { isFinal ? fnal : contn }
    </div>
  )
}

export default NavigationButtons
