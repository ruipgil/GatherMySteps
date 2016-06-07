import {
  ADD_TRACK,
  ADD_MULTIPLE_TRACKS,
  TOGGLE_TRACK_RENAMING,
  UPDATE_TRACK_NAME
} from './'
import { Set } from 'immutable'
import { fitSegments } from 'actions/ui'

export const addTrack = (segments, name, locations = [], transModes = []) => {
  return {
    segments,
    name,
    locations,
    transModes,
    type: ADD_TRACK
  }
}

export const addMultipleTracks = (tracks, options) => {
  return (dispatch, getState) => {
    const getSegKeys = () => Set(getState().get('tracks').get('segments').keySeq())
    const previous = getSegKeys()
    dispatch({
      tracks,
      type: ADD_MULTIPLE_TRACKS
    })

    const diff = getSegKeys().subtract(previous)
    dispatch(fitSegments(...diff.toJS()))
  }
}

export const toggleTrackRenaming = (trackId) => {
  return {
    trackId,
    type: TOGGLE_TRACK_RENAMING
  }
}

export const updateTrackName = (trackId, newName) => {
  return {
    trackId,
    name: newName,
    type: UPDATE_TRACK_NAME
  }
}

const exportGPX = (trackId, state) => {
  state = state.get('tracks')
  return state.get('tracks').get(trackId).get('segments').reduce((prev, s) => {
    s = state.get('segments').get(s)
    return prev + s.get('points').reduce((prev, p) => {
      return prev + '<trkpt lat="' + p.get('lat') + '" lon="' + p.get('lon') + '">' +
      '<time>' + p.get('time').toISOString() + '</time>' +
      '</trkpt>'
    }, '<trkseg>') + '</trkseg>'
  }, '<?xml version="1.0" encoding="UTF-8"?><gpx xmlns="http://www.topografix.com/GPX/1/1"><trk>') + '</trk></gpx>'
}

import saveData from './saveData'

export const downloadTrack = (trackId) => {
  return (_, getState) => {
    let str = exportGPX(trackId, getState())
    saveData(str, getState().get('tracks').get('tracks').get(trackId).get('name'))
  }
}

export const downloadAll = () => {
  return (dispatch, getState) => {
    getState().get('tracks').get('tracks').keySeq().forEach((t) => {
      console.log(t)
      dispatch(downloadTrack(t))
    })
  }
}

import { toggleSegmentDisplay } from 'actions/segments'

export const showHideAll = () => {
  return (dispatch, getState) => {
    getState().get('tracks').get('segments').keySeq().forEach((seg) => {
      dispatch(toggleSegmentDisplay(seg))
    })
  }
}

export const clearAll = () => {
  return (dispatch, getState) => {
    getState().get('tracks').get('tracks').keySeq().forEach((t) => {
      //dispatch(removeTrack(t))
      alert('Not yet implemented')
    })
  }
}
