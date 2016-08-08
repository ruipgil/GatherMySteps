import React from 'react'

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

const PaneDrawer = ({ showList, remainingCount, onClick }) => {
  if (process.env.BUILD_GPX) {
    return null
  }

  return (
    <div style={{ color: 'gray', textAlign: 'center', fontSize: '0.9rem' }} className='clickable' onClick={onClick}>
      {
        showList
          ? <div><i className='fa fa-pencil fa-fw fa-ih' />Edit tracks of the current day</div>
        : remainingMessage(remainingCount)
      }
    </div>
  )
}

export default PaneDrawer
