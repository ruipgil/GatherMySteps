import { ADVANCE_TO_ADJUST } from './'
import fetch from 'isomorphic-fetch'

const segmentsToJson = (state) => {
  return state.get('tracks').get('segments').map((segment) => {
    return {
      points: segment.get('points'),
      name: segment.get('name')
    }
  }).toJS()
}

const advanceToAdjust = (track) => {
  return {
    type: ADVANCE_TO_ADJUST,
    track
  }
}

export const nextStep = () => {
  return (dispatch, getState) => {
    const step = getState().get('progress')
    if (step === undefined || step === 0) {
      const options = {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
          type: 'PROCESS',
          data: segmentsToJson(getState())
        })
      }

      return fetch('//localhost:5000/process', options)
        .then((response) => response.json())
        .catch((err) => {
          console.log(err)
        })
        .then((json) => {
          const track = json.results.points.filter((s) => s.length > 0)
          const action = advanceToAdjust(track)
          dispatch(action)
          dispatch(removeTracksFor(track))
        })
    } else if (step === 1) {
      /*return fetch('http://localhost:5000/semantic')
        .then((response) => response.json())
        .then((json) => dispatch(removeTracksFor(json.segments)))*/
    } else {
      console.log('no!')
    }
  }
}

export const removeTracksFor = (segments) => {
  return {
    segments,
    type: 'REMOVE_TRACKS_FOR'
  }
}
