import React from 'react'
import { render } from 'react-dom'
import DetailPopup from './DetailPopup'
import {
  selectPoint,
  deselectPoint,
  straightSelected,
  interpolateTimeSelected
} from 'actions/segments'

export default (lseg, current, dispatch) => {
  return (e) => {
    const { target, originalEvent } = e
    const { shiftKey } = originalEvent

    const index = target.index

    const openPopupFor = (target, index, bulk = false) => {
      const point = current.get('points').get(index)
      const previousPoint = current.get('points').get(index - 1)
      const nextPoint = current.get('points').get(index + 1)

      const pm = current.get('metrics').get('points').get(index)
      const count = current.get('points').count()
      const next = (i) => {
        target.closePopup()
        target = lseg.points.getLayers()[i]
        openPopupFor(target, i)
      }
      let popup
      if (!bulk) {
        popup = (
          <DetailPopup
            lat={point.get('lat')}
            lon={point.get('lon')}
            time={point.get('time')}

            distance={pm.get('distance')}
            velocity={pm.get('velocity')}

            previousPoint={previousPoint}
            nextPoint={nextPoint}

            i={index}
            count={count}
            editable={true}
            onMove={next} />
        )
      } else {
        popup = (
          <div>
            <div>
              <a className='button' onClick={() => dispatch(straightSelected(current.get('id')))}>Straight line</a>
            </div>
            <div>
              <a className='button' onClick={() => dispatch(interpolateTimeSelected())}>Interpolate time</a>
            </div>
          </div>
        )
      }
      const div = document.createElement('div')
      render(popup, div)
      target.bindPopup(div).openPopup()
    }

    if (shiftKey) {
      const selected = dispatch(selectPoint(current.get('id'), index))
      if (selected && selected.count() !== 0) {
        openPopupFor(target, index, selected)
      }
    } else {
      dispatch(deselectPoint())
      openPopupFor(target, index)
    }
  }
}
