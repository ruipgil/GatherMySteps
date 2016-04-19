export default (lseg, current, previous, onSplit) => {
  const id = current.get('id')
  lseg.points.on('click', (target) => {
    const index = target.layer.index

    lseg.details.removeLayer(lseg.points)
    onSplit(id, index)
  })
  lseg.tearDown = () => {
    lseg.details.removeLayer(lseg.points)
    lseg.points.off('click')
    lseg.tearDown = null
  }
  lseg.points.addTo(lseg.details)
}
