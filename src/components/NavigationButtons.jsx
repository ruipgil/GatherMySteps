import React from 'react'
import AsyncButton from 'components/AsyncButton'

const NavigationButtons = ({ onPrevious, onNext, stage, canProceed }) => {
  return (
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
}

export default NavigationButtons
