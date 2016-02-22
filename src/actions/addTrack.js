import { genTrackId, genSegId } from './idState'
import colors from './colors'

const addTrack = (track, file) => {
  let id = genTrackId()
  return {
    type: 'ADD_TRACK',
    track: {
      id,
      segments: track.map((segment) => {
        let sId = genSegId()
        return {
          id: sId,
          points: segment,
          display: true,
          start: segment[0].time,
          end: segment[segment.length - 1].time,
          color: colors(sId),
          name: '',
          editing: false,
          spliting: false,
          joining: false,
          pointDetails: false
        }
      }),
      name: file.name
    }
  }
}

export default addTrack
