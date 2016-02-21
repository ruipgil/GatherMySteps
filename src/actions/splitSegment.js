import { genSegId } from './idState'
import colors from './colors'

const splitSegment = (segmentId, index) => {
  const sId = genSegId()
  return {
    index,
    segmentId,
    segmentInfo: {
      id: sId,
      points: [],
      display: true,
      start: null,
      end: null,
      color: colors(sId),
      name: '',
      editing: false,
      spliting: false,
      joining: false
    },
    type: 'SPLIT_SEGMENT'
  }
}

export default splitSegment
