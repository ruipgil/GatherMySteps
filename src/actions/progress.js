import fetch from 'isomorphic-fetch'

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

const updateState = (dispatch, json) => {
  dispatch(setServerState(json.step, json.queue))
  dispatch(removeTracksFor(json.track.segments, json.track.name, json.track.locations))
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
      .then((json) => updateState(dispatch, json))
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
      .then((json) => updateState(dispatch, json))
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
      .then((json) => updateState(dispatch, json))
  }
}

export const removeTracksFor = (segments, name, locations = [], transModes = []) => {
  return {
    segments,
    name,
    locations,
    transModes,
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
