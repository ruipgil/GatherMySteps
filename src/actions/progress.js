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

export const setServerState = (step, tracksRemaining, daySelected, life) => {
  return {
    step,
    life,
    tracksRemaining,
    daySelected,
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
  // if (json.step === 2) {
  //   dispatch(removeTracksFor(json.track.segments, json.track.name))
  // }
  dispatch(setServerState(json.step, json.queue, json.currentDay, json.life))
  // if (json.step !== 2) {
    dispatch(removeTracksFor(json.track.segments, json.track.name))
  // }

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
    const hasLIFE = getState().get('tracks').get('LIFE')
    const options = {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        track: {
          name: getState().get('tracks').get('tracks').first().get('name') || '',
          segments: segmentsToJson(getState())
        },
        LIFE: hasLIFE ? hasLIFE.get('text') : null,
        changes: getState().get('tracks').get('history').get('past').map((undo) => {
          return { ...undo, undo: null }
        })
      })
    }
    return fetch(getState().get('progress').get('server') + '/next', options)
      .then((response) => response.json())
      .catch((err) => console.log(err))
      .then((json) => updateState(dispatch, json, getState))
  }
}

export const removeTracksFor = (segments, name, life) => {
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

export const changeDayToProcess = (newDay) => {
  return (dispatch, getState) => {
    const options = {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        day: newDay
      })
    }
    return fetch(getState().get('progress').get('server') + '/changeDay', options)
      .then((response) => response.json())
      .catch((e) => console.error(e))
      .then((json) => updateState(dispatch, json, getState))
  }
}

export const reloadQueue = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'GET',
      mode: 'cors'
    }
    return fetch(getState().get('progress').get('server') + '/reloadQueue', options)
      .then((response) => response.json())
      .catch((e) => console.error(e))
      .then((json) => updateState(dispatch, json, getState))
  }
}

export const bulkProcess = () => {
  return (dispatch, getState) => {
    const options = {
      method: 'GET',
      mode: 'cors'
    }
    return fetch(getState().get('progress').get('server') + '/bulkProcess', options)
      .then((response) => response.json())
      .catch((e) => console.error(e))
      .then((json) => updateState(dispatch, json, getState))
  }
}
