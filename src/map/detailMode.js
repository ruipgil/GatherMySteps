import { createPopup, openPopup } from './createPopup'

export default (lseg, current, previous) => {
  lseg.points.on('click', (target) => {
    const { layer } = target
    const { index } = layer
    const next = (i) => {
      layer.closePopup()
      const targetLayer = lseg.points.getLayers()[i]

      const popup = createPopup(current.get('points'), i, false, next)
      openPopup(popup, targetLayer)
    }

    const popup = createPopup(current.get('points'), index, false, next)
    openPopup(popup, layer)
  })

  lseg.points.addTo(lseg.details)
  lseg.tearDown = () => {
    lseg.points.off('click')
    lseg.details.removeLayer(lseg.points)
    lseg.tearDown = null
  }
}
