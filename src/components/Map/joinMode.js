import { createPointIcon } from './utils'
import { FeatureGroup, Polyline, Marker } from 'leaflet'

export default (lseg, current, previous, onJoin) => {
  const id = current.get('id')
  const possibilities = current.get('joinPossible')

  const icon = createPointIcon()

  let reset = () => {}
  const groups = possibilities.map((pp) => {
    const { union } = pp
    return new FeatureGroup(union.map((hy, i) => {
      hy = hy.map((x) => ({ lat: x.get('lat'), lng: x.get('lon') }))
      return new FeatureGroup([
        new Polyline(hy, { color: '#69707a', weight: 8 }),
        new Marker(hy[0], { icon }),
        new Marker(hy[hy.length - 1], { icon })
      ]).on('click', () => {
        reset()
        onJoin(id, i, pp)
      })
    })).addTo(lseg.details)
  })

  reset = () => {
    groups.forEach((group) => {
      lseg.details.removeLayer(group)
    })
    lseg.tearDown = null
  }
  lseg.tearDown = reset
}
