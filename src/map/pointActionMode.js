export default (lseg, current, previous) => {
  const action = current.get('pointAction')
  if (!action) {
    return
  }

  const onClick = action.get('onClick')
  // const highlighted = action.get('highlighted')

  lseg.points.on('click', (target) => {
    const index = target.layer.index
    onClick(index, current.get('points').get(index))
  })

  // if (highlighted) {
  //   lseg.points.getLayers()[highlighted].setStyle()
  // }

  lseg.points.addTo(lseg.details)
  lseg.tearDown = () => {
    lseg.points.off('click')
    lseg.details.removeLayer(lseg.points)
    lseg.tearDown = null
  }
}
