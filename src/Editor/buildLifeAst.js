import { Map } from 'immutable'
import moment from 'moment'
import LIFEParser from './life.peg.js'

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
  if (a.hours() < b.hours()) {
    return true
  } else if (a.hours() === b.hours() && a.minutes() <= b.minutes()) {
    return true
  } else {
    return false
  }
}

const isBetween = (a, b, c) => {
  return isGTE(a, b) && isGTE(b, c)
}

const findPointInSegments = (date, segments, reverse = false) => {
  let iter = segments.keySeq()
  for (let segmentId of iter.toJS()) {
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
    let timezone = 0

    for (let block of fragments.blocks) {
      if (block.type === 'Timezone') {
        timezone = block.value
      }
      if (block.type === 'Trip' || block.type === 'Stay') {
        const { timespan } = block
        timespan.timezone = timezone
        const fromTime = timeToMoment(currentDay, timespan.start.value)
        const toTime = timeToMoment(currentDay, timespan.finish.value)

        const fromPoint = findPointInSegments(fromTime, segments)
        const toPoint = findPointInSegments(toTime, segments, true)
        block.references = { to: toPoint, from: fromPoint }

        if (block.type === 'Trip' && block.tmodes) {
          block.tmodes.forEach((tmode) => {
            const tmFromPoint = findPointInSegments(timeToMoment(currentDay, tmode.timespan.start.value), segments)
            const tmToPoint = findPointInSegments(timeToMoment(currentDay, tmode.timespan.finish.value), segments, true)
            tmode.references = { to: tmToPoint, from: tmFromPoint }
            tmode.timespan.timezone = timezone
          })
        }
      }
    }
    return fragments
  } catch (e) {
    console.log(e)
    throw e
  }
}
