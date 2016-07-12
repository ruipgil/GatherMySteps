import React from 'react'
import { render } from 'react-dom'
import DetailPopup from './DetailPopup'

const createPopup = (points, index, editable, next, more) => {
  const point = points.get(index)
  const previousPoint = index > 0 ? points.get(index - 1) : null
  const nextPoint = points.get(index + 1)

  return (
    <DetailPopup
      previous={previousPoint}
      current={point}
      next={nextPoint}

      i={index}
      editable={editable}
      onMove={next}
      {...more} />
  )
}

const openPopup = (popup, target) => {
  const div = document.createElement('div')
  render(popup, div)
  target.bindPopup(div, { maxWidth: '500px' }).openPopup()
}

export { createPopup, openPopup }
