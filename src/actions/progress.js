import fetch from 'isomorphic-fetch'
import { reset as resetId } from 'reducers/idState'
import { fitSegments, toggleConfig } from 'actions/ui'
import { addPossibilities } from 'actions/segments'

const segmentsToJson = (state) => {
  return state.get('tracks').get('segments').valueSeq().map((segment) => {
    return {
      points: segment.get('points'),
      name: segment.get('name')
    }
  }).toJS()
}

export const setServerState = (step, tracksRemaining) => {
  return {
    step,
    tracksRemaining,
    type: 'SET_SERVER_STATE'
  }
}

export const updateConfig = (config) => ({
  config,
  type: 'UPDATE_CONFIG'
})

export const getConfig = (cb) => {
  return (dispatch, getState) => {
    const options = {
      method: 'GET',
      mode: 'cors'
    }
    return fetch(getState().get('progress').get('server') + '/config', options)
      .then((response) => response.json())
      .then((config) => {
        dispatch(updateConfig(config))
      })
  }
}

export const saveConfig = (config) => {
  // const { address } = config._
  config._ = null
  return (dispatch, getState) => {
    const options = {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(config)
    }
    return fetch(getState().get('progress').get('server') + '/config', options)
      .then((response) => response.json())
      .then((config) => {
        dispatch(toggleConfig())
        // Request server state if address has changed
        // dispatch(requestServerState())
      })
  }
}

export const completeTrip = (segmentId, from, to, index) => {
  return (dispatch, getState) => {
    const options = {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        from,
        to
      })
    }
    console.log('going to the server')
    fetch(getState().get('progress').get('server') + '/completeTrip', options)
      .then((response) => response.json())
      .catch((err) => {
        console.log(err)
      })
      .then((json) => {
        json.possibilities.forEach((p, i) => {
          dispatch(addPossibilities(segmentId, p, index, json.weights[i]))
        })
      })
  }
}

const updateState = (dispatch, json, getState, reverse = false) => {
  resetId()
  console.log('Payload')
  console.log(json)
  if (json.step === 2) {
    dispatch(removeTracksFor(json.track.segments, json.track.name))
  }
  dispatch(setServerState(json.step, json.queue))
  if (json.step !== 2) {
    dispatch(removeTracksFor(json.track.segments, json.track.name))
  }

  const segments = getState().get('tracks').get('segments').keySeq().toJS()
  dispatch(fitSegments(...segments))
}

export const requestServerState = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'GET',
      mode: 'cors'
    }
    fetch(getState().get('progress').get('server') + '/current', options)
      .then((response) => response.json())
      .catch((err) => {
        console.log(err)
      })
      .then((json) => updateState(dispatch, json, getState))
  }
}

export const previousStep = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'GET',
      mode: 'cors'
    }
    return fetch(getState().get('progress').get('server') + '/previous', options)
      .then((response) => response.json())
      .catch((err) => console.log(err))
      .then((json) => updateState(dispatch, json, getState, true))
  }
}

export const nextStep = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        track: {
          name: getState().get('tracks').get('tracks').first().get('name') || '',
          segments: segmentsToJson(getState())
        },
        touched: []
      })
    }
    return fetch(getState().get('progress').get('server') + '/next', options)
      .then((response) => response.json())
      .catch((err) => console.log(err))
      .then((json) => updateState(dispatch, json, getState))
  }
}

export const removeTracksFor = (segments, name) => {
  return {
    segments,
    name,
    type: 'REMOVE_TRACKS_FOR'
  }
}

export const redo = () => {
  return (dispatch, getState) => {
    const state = getState().get('tracks')
    let toPut = state.get('history').get('future').get(-1)
    if (toPut) {
      toPut.undo = null
      dispatch({
        type: 'REDO'
      })
      return dispatch(toPut)
    } else {
      return state
    }
  }
}

export const undo = () => {
  return {
    type: 'UNDO'
  }
}
