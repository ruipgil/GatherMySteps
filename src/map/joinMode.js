import { createPointIcon } from './utils'
import { FeatureGroup, Polyline, Marker } from 'leaflet'

export default (lseg, current, previous, onJoin) => {
  const id = current.get('id')
  const possibilities = current.get('joinPossible')

  const icon = createPointIcon()

  let reset = () => {}
  const groups = possibilities.map((pp) => {
    const { weights, union } = pp
    return new FeatureGroup(union.map((hy, i) => {
      if (union.length > 1 && i === 0) {
        return new FeatureGroup()
      }

      hy = hy.map((x) => ({ lat: x.get('lat'), lng: x.get('lon') }))

      let grp = [
        new Polyline(hy, { color: '#69707a', weight: 10 * weights[i] })
      ]
      if (union.length <= 2) {
        grp.push(new Marker(hy[0], { icon }))
        grp.push(new Marker(hy[hy.length - 1], { icon }))
      }
      return new FeatureGroup(grp).on('click', () => {
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
