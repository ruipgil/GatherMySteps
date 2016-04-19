import React from 'react'
import { render } from 'react-dom'
import DetailPopup from './DetailPopup'

export default (lseg, current, previous) => {
  lseg.points.on('click', (target) => {
    const index = target.layer.index

    const openPopupFor = (target, index) => {
      const point = current.get('points').get(index)
      const pm = current.get('metrics').get('points').get(index)
      const count = current.get('points').count()
      const next = (i) => {
        target.closePopup()
        target = lseg.points.getLayers()[i]
        openPopupFor(target, i)
      }
      const popup = (
        <DetailPopup
          lat={point.get('lat')}
          lon={point.get('lon')}
          time={point.get('time')}
          distance={pm.get('distance')}
          velocity={pm.get('velocity')}
          i={index}
          count={count}
          onMove={next} />
      )
      const div = document.createElement('div')
      render(popup, div)
      target.bindPopup(div).openPopup()
    }

    openPopupFor(target.layer, index)
  })
  lseg.points.addTo(lseg.details)
  lseg.tearDown = () => {
    lseg.points.off('click')
    lseg.details.removeLayer(lseg.points)
    lseg.tearDown = null
  }
}
