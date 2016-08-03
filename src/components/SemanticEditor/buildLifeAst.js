import moment from 'moment'
import LIFEParser from 'components/utils/life.peg.js'

const findPointInSegments = (date, segments) => {
  const S_60 = 60 * 1000
  const dateValue = date.valueOf()
  for (let segmentId of segments.keySeq().toJS()) {
    const segment = segments.get(segmentId)
    const points = segment.get('points')
    let startTime = points.get(0).get('time').valueOf() - S_60
    let endTime = points.get(-1).get('time').valueOf() + S_60
    if (startTime <= dateValue && dateValue <= endTime) {
      for (let i = 1; i < points.count(); i++) {
        startTime = points.get(i - 1).get('time').valueOf() - S_60
        endTime = points.get(i).get('time').valueOf() + S_60
        if (startTime <= dateValue && dateValue <= endTime) {
          return { segmentId, index: i - 1 }
        }
      }

      return { segmentId, index: points.count() - 1 }
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
