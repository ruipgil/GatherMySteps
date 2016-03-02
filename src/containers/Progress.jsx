import React from 'react'
// import { connect } from 'react-redux'
// import { previousStep, nextStep } from '../actions/progress'

let Progress = ({ onPrevious, onNext }) => {
  return (
    <div>
      <div onClick={onPrevious} className='previousBtn'>
        Previous
      </div>
      <div onClick={onNext} className='nextBtn'>
        Next
      </div>
    </div>
  )
}

export default Progress
