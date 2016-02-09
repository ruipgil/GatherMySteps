import React from 'react'

const Dropzone = (props) => {
  const { children, onDrop, onOver } = props

  const drop = (e) => {
    e.preventDefault()

    if (onDrop) {
      onDrop(e)
    }
  }

  const cancel = (e) => {
    e.preventDefault()
    if (onOver) {
      onOver(e)
    }
    return false
  }

  return (
    <div {...props} onDrop={drop} onDragOver={cancel} onDragEnter={cancel}>
      { children }
    </div>
  )
}

export default Dropzone
