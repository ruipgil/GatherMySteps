import { Map } from 'immutable'
import moment from 'moment'
import LIFEParser from 'components/utils/life.peg.js'

const sameMilitary = (a, b) => {
  return a.minutes() === b.minutes() && a.hours() === b.hours()
}

const getPointForTime = (from, to, time) => {
  const fromTime = from.get('time')
  if (sameMilitary(fromTime, time)) {
    return from
  }

  const toTime = to.get('time')
  if (sameMilitary(toTime, time)) {
    return to
  }

  const dlat = to.get('lat') - from.get('lat')
  const dlon = to.get('lon') - from.get('lon')

  const dt1 = fromTime.valueOf() - time.valueOf()
  const dt2 = fromTime.valueOf() - toTime.valueOf()
  const dtNorm = dt1 / dt2

  const lat = from.get('lat') + dlat * dtNorm
  const lon = from.get('lon') + dlon * dtNorm

  return Map({
    lat,
    lon
  })
}

const isGTE = (a, b) => {
  return a.hours() <= b.hours() && a.minutes() <= b.minutes()
}

const isBetween = (a, b, c) => {
  return isGTE(a, b) && isGTE(b, c)
}

const findPointInSegments = (date, segments) => {
  // const S_60 = 60 * 1000
  // const dateValue = date.valueOf()
  for (let segmentId of segments.keySeq().toJS()) {
    const segment = segments.get(segmentId)
    const points = segment.get('points')

    if (isBetween(points.get(0).get('time'), date, points.get(-1).get('time'))) {
      for (let i = 1; i < points.count(); i++) {
        if (isBetween(points.get(i - 1).get('time'), date, points.get(i).get('time'))) {
          const point = getPointForTime(points.get(i - 1), points.get(i), date)
          return { segmentId, index: i - 1, point }
        }
      }
    }
  }
  return null
}

const timeToMoment = (day, time) => {
  return moment(day + ' ' + time.slice(0, 2) + ':' + time.slice(2))
}

export default (text, segments) => {
  try {
    const fragments = LIFEParser.parse(text)
    const { year, month, day } = fragments.day.value
    const currentDay = year + '-' + month + '-' + day

    for (let block of fragments.blocks) {
      switch (block.type) {
        case 'Trip':
        case 'Stay':
          const { timespan } = block
          const fromTime = timeToMoment(currentDay, timespan.start.value)
          const toTime = timeToMoment(currentDay, timespan.finish.value)

          const fromPoint = findPointInSegments(fromTime, segments)
          const toPoint = findPointInSegments(toTime, segments)
          block.references = { to: toPoint, from: fromPoint }
          break
      }
    }
    return fragments
  } catch (e) {
    throw e
  }
}
