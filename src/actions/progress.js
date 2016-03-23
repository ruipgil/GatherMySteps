import { PREVIEW_STAGE, ADJUST_STAGE } from '../constants'
import { ADVANCE_TO_ADJUST, ADVANCE_TO_ANNOTATE } from './'
import fetch from 'isomorphic-fetch'

const segmentsToJson = (state) => {
  return state.get('tracks').get('segments').map((segment) => {
    return {
      points: segment.get('points'),
      name: segment.get('name')
    }
  }).toJS()
}

const advanceToAdjust = () => {
  return {
    type: ADVANCE_TO_ADJUST
  }
}

const advanceToAnnotate = () => {
  return {
    type: ADVANCE_TO_ANNOTATE
  }
}

export const nextStep = () => {
  return (dispatch, getState) => {
    const step = getState().get('progress')
    if (step === PREVIEW_STAGE) {
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
          const action = advanceToAdjust()
          dispatch(action)
          dispatch(removeTracksFor(track))
        })
    } else if (step === ADJUST_STAGE) {
      return Promise.resolve()
        .then(() => {
          const action = advanceToAnnotate()
          dispatch(action)
        })
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

export const redo = () => {
  return {
    type: 'REDO'
  }
}

export const undo = () => {
  return {
    type: 'UNDO'
  }
}
