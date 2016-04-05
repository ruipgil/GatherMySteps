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
      .then((json) => {
        console.log(json)
        dispatch(setServerState(json.step, json.files))
        dispatch(removeTracksFor(json.track.segments, json.track.name))
      })
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
      .then((json) => {
        console.log(json)
        dispatch(removeTracksFor(json.track.segments, json.track.name))
        dispatch(setServerState(json.step, json.files))
      })
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
      .then((json) => {
        console.log(json)
        dispatch(removeTracksFor(json.track.segments, json.track.name))
        dispatch(setServerState(json.step, json.files))
      })
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
  return {
    type: 'REDO'
  }
}

export const undo = () => {
  return {
    type: 'UNDO'
  }
}
