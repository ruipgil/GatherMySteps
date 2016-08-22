import React from 'react'
import AsyncButton from 'components/AsyncButton'

const buttonStyle = {
  flex: 1,
  flexGrow: 1
}

const NavigationButtons = ({ canPrevious, onPrevious, canSkip, onSkip, onNext, canProceed }) => {
  const previous = (
    <AsyncButton style={buttonStyle} className={'is-warning'} onClick={onPrevious} disabled={!canPrevious}>
      <i className='fa fa-chevron-left' style={{ float: 'left', marginRight: '1rem' }} /> Previous
    </AsyncButton>
  )
  const skip = (
    <AsyncButton style={buttonStyle} className={'is-warning'} onClick={onSkip} disabled={!canSkip}>
      Skip day
      <i className='fa fa-angle-double-right' style={{ float: 'right', marginLeft: '1rem' }} />
    </AsyncButton>
  )
  return (
    <div style={{ display: 'flex' }} className='control has-addons'>
      { canPrevious ? previous : skip }
      <AsyncButton style={buttonStyle} disabled={!canProceed} className={'is-success'} onClick={onNext}>
        Continue <i className='fa fa-chevron-right' style={{ float: 'right', marginLeft: '1rem' }} />
      </AsyncButton>
    </div>
  )
}

export default NavigationButtons
