import moment from 'moment'
import { genTrackId, genSegId } from './idState'
import colors from './colors'
import haversine from '../haversine'
import { Map, List, fromJS } from 'immutable'

export const max = (a, b) => a >= b ? a : b
export const min = (a, b) => a <= b ? a : b

export const updateBoundsWithPoint = (point, bounds) => {
  return [
    { lat: min(bounds.lat[0], point.lat),
      lon: min(bounds.lon[0], point.lon)
    },
    { lat: max(bounds.lat[1], point.lat),
      lon: max(bounds.lon[1], point.lon)
    }
  ]
}

export const calculateBoundsImmutable = (points) => {
  let bounds = [{lat: Infinity, lon: Infinity}, {lat: -Infinity, lon: -Infinity}]
  points
  .map((t) => { return {lat: t.get('lat'), lon: t.get('lon')} })
  .forEach((elm) => {
    bounds[0].lat = min(bounds[0].lat, elm.lat)
    bounds[0].lon = min(bounds[0].lon, elm.lon)
    bounds[1].lat = max(bounds[1].lat, elm.lat)
    bounds[1].lon = max(bounds[1].lon, elm.lon)
  })
  return bounds
}

export const calculateBounds = (state) => {
  let bounds = [{lat: Infinity, lon: Infinity}, {lat: -Infinity, lon: -Infinity}]
  state.get('points').forEach((elm) => {
    bounds[0].lat = min(bounds[0].lat, elm.get('lat'))
    bounds[0].lon = min(bounds[0].lon, elm.get('lon'))
    bounds[1].lat = max(bounds[1].lat, elm.get('lat'))
    bounds[1].lon = max(bounds[1].lon, elm.get('lon'))
  })
  return state.set('bounds', fromJS(bounds))
}

export const getSegmentById = (id, state) =>
  state.map((track) =>
    track.segments.find((x) => x.id === id)
  ).find((x) => !!x)

export const getTrackBySegmentId = (id, state) =>
  state.map((track) =>
    track.segments.find((s) => s.id === id) ? track : null
  ).find((x) => !!x)

export const createSegmentObj = (trackId, points, location, transModes, nSegs, customId) => {
  let sId = customId === undefined ? genSegId() : customId
  const pointsImmutable = List(points.map((point) => {
    return Map({
      time: moment(point.time),
      lat: point.lat,
      lon: point.lon
    })
  }))
  let state = Map({
    trackId,
    id: sId,
    points: pointsImmutable,
    display: true,
    start: pointsImmutable.get(0).get('time'),
    end: pointsImmutable.get(-1).get('time'),
    color: colors(customId === undefined ? max(nSegs, sId) : customId),
    name: '',
    editing: false,
    spliting: false,
    joining: false,
    pointDetails: false,
    timeFilter: List([]),
    showTimeFilter: false,
    bounds: List([]),
    metrics: Map({}),

    locations: fromJS(location),
    transportationModes: fromJS(transModes)
  })
  state = calculateMetrics(state)
  state = calculateBounds(state)
  return state
}

export const createTrackObj = (name, segments, locations = [], transModes = [], n = 0) => {
  let id = genTrackId()
  let segs = segments.map((segment, i) => createSegmentObj(id, segment, locations[i], transModes[i], n + i))
  return {
    track: Map({
      id,
      segments: List(segs.map((s) => s.get('id'))),
      name: name,
      renaming: false
    }),
    segments: segs
  }
}

export const calculateMetrics = (state) => {
  const convert = 1 / 3600000
  const pointMetrics = state.get('points').map((curr, i, arr) => {
    const lat = curr.get('lat')
    const lon = curr.get('lon')
    const time = curr.get('time')
    if (i !== 0) {
      let prev = arr.get(i - 1)

      let distance = haversine(prev.get('lat'), prev.get('lon'), lat, lon, {unit: 'km'})
      let timeDiff = curr.get('time').diff(prev.get('time')) * convert
      let velocity = timeDiff === 0 ? 0 : distance / timeDiff
      return Map({
        distance,
        velocity,
        lat,
        lon,
        time
      })
    } else {
      return Map({
        distance: 0,
        velocity: 0,
        lat,
        lon,
        time
      })
    }
  })

  const totalDistance = pointMetrics.reduce((total, point) => total + point.get('distance'), 0)
  const averageVelocity = pointMetrics.reduce((total, point) => total + point.get('velocity'), 0) / pointMetrics.count()

  return state.set('metrics', Map({
    totalDistance,
    averageVelocity,
    points: pointMetrics
  }))
}

