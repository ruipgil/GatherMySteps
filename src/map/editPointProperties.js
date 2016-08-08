import React from 'react'
import { createPopup, openPopup } from './createPopup'
import {
  selectPoint,
  updatePoint,
  deselectPoint,
  straightSelected
  // interpolateTimeSelected
} from 'actions/segments'

export default (lseg, current, dispatch) => {
  return (e) => {
    const { target, originalEvent } = e
    const { shiftKey } = originalEvent
    const { index } = target

    const cPopup = (index, next) => {
      return createPopup(current.get('points'), index, true, next, {
        onSave: (lat, lon, time) => dispatch(updatePoint(current.get('id'), index, lat, lon, time))
      })
    }

    const openPopupFor = (layer, index, bulk = false) => {
      const next = (i) => {
        layer.closePopup()
        const targetLayer = lseg.points.getLayers()[i]

        const popup = cPopup(index, next)
        openPopup(popup, targetLayer)
      }

      let popup
      if (!bulk) {
        popup = cPopup(index, next)
      } else {
        popup = (
          <div>
            <div>
              <a className='button' onClick={() => dispatch(straightSelected(current.get('id')))}>Straight line</a>
            </div>
            {
            // <div>
            //   <a className='button' onClick={() => dispatch(interpolateTimeSelected())}>Interpolate time</a>
            // </div>
            }
          </div>
        )
      }
      openPopup(popup, layer)
    }

    if (shiftKey) {
      const selected = dispatch(selectPoint(current.get('id'), index))
      if (selected && selected.count() > 1) {
        openPopupFor(target, index, selected)
      }
    } else {
      dispatch(deselectPoint(current.get('id')))
      openPopupFor(target, index)
    }
  }
}
