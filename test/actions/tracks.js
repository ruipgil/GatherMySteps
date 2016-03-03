import expect from 'expect'
import moment from 'moment'
import {
  ADD_TRACK, TOGGLE_TRACK_RENAMING, UPDATE_TRACK_NAME
} from '../../src/actions'
import * as tactions from '../../src/actions/tracks'

describe('tactions', () => {
  const segments = [
    [
      { lat: 1, lon: 1, time: moment().add(1, 's') },
      { lat: 1.2, lon: 1, time: moment().add(2, 's') },
      { lat: 1.3, lon: 1, time: moment().add(4, 's') },
      { lat: 1.3, lon: 1.1, time: moment().add(8, 's') },
      { lat: 1.4, lon: 1.1, time: moment().add(10, 's') }
    ]
  ]

  it('should create an action to add a track', () => {
    const name = 'trackA.gpx'
    const expectedAction = {
      type: ADD_TRACK,
      name,
      segments
    }
    expect(tactions.addTrack(segments, name)).toEqual(expectedAction)
  })

  it('should create an action to toggle track renaming', () => {
    const trackId = 1
    const expectedAction = {
      type: TOGGLE_TRACK_RENAMING,
      trackId
    }
    expect(tactions.toggleTrackRenaming(trackId)).toEqual(expectedAction)
  })

  it('should create an action to update the track name', () => {
    const trackId = 1
    const name = 'trackA'
    const expectedAction = {
      type: UPDATE_TRACK_NAME,
      name,
      trackId
    }
    expect(tactions.updateTrackName(trackId, name)).toEqual(expectedAction)
  })
})
