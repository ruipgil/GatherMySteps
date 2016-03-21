import moment from 'moment'
import { genTrackId, genSegId } from './idState'
import colors from './colors'
import haversine from 'haversine'

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

export const calculateBounds = (points) => {
  let bounds = [{lat: Infinity, lon: Infinity}, {lat: -Infinity, lon: -Infinity}]
  points
  .map((t) => { return {lat: t.lat, lon: t.lon} })
  .forEach((elm) => {
    bounds[0].lat = min(bounds[0].lat, elm.lat)
    bounds[0].lon = min(bounds[0].lon, elm.lon)
    bounds[1].lat = max(bounds[1].lat, elm.lat)
    bounds[1].lon = max(bounds[1].lon, elm.lon)
  })
  return bounds
}

export const getSegmentById = (id, state) =>
  state.map((track) =>
    track.segments.find((x) => x.id === id)
  ).find((x) => !!x)

export const getTrackBySegmentId = (id, state) =>
  state.map((track) =>
    track.segments.find((s) => s.id === id) ? track : null
  ).find((x) => !!x)

export const createSegmentObj = (trackId, points) => {
  let sId = genSegId()
  return {
    trackId,
    id: sId,
    points: points.map((point) => {
      point.time = moment(point.time)
      return point
    }),
    display: true,
    start: points[0].time,
    end: points[points.length - 1].time,
    color: colors(sId),
    name: '',
    editing: false,
    spliting: false,
    joining: false,
    pointDetails: false,
    timeFilter: [],
    showTimeFilter: false,
    bounds: calculateBounds(points),
    metrics: calculateMetrics(points)
  }
}

export const createTrackObj = (name, segments) => {
  let id = genTrackId()
  let segs = segments.map((segment) => createSegmentObj(id, segment))
  return {
    track: {
      id,
      segments: segs.map((s) => s.id),
      name: name,
      renaming: false
    },
    segments: segs
  }
}

export const calculateMetrics = (points) => {
  const convert = 1 / 3600000
  points = points.map((p) => {
    return { latitude: p.lat, longitude: p.lon, time: p.time }
  }).map((curr, i, arr) => {
    if (i !== 0) {
      let prev = arr[i - 1]
      let distance = haversine(prev, curr, {unit: 'km'})
      let timeDiff = curr.time.diff(prev.time) * convert
      let velocity = timeDiff === 0 ? 0 : distance / timeDiff
      return {
        distance,
        velocity,
        lat: curr.latitude,
        lon: curr.longitude,
        time: curr.time
      }
    } else {
      return {
        distance: 0,
        velocity: 0,
        lat: curr.latitude,
        lon: curr.longitude,
        time: curr.time
      }
    }
  })

  const totalDistance = points.reduce((total, point) => total + point.distance, 0)
  const averageVelocity = points.reduce((total, point) => total + point.velocity, 0) / points.length

  return {
    totalDistance,
    averageVelocity,
    points
  }
}

