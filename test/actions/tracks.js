import expect from 'expect'
import sampleSegment from './sampleSegment'
import {
  ADD_TRACK, TOGGLE_TRACK_RENAMING, UPDATE_TRACK_NAME
} from '../../src/actions'
import * as tactions from '../../src/actions/tracks'

describe('tactions', () => {
  const segments = sampleSegment

  it('should create an action to add a track', () => {
    const name = 'trackA.gpx'
    const expectedAction = {
      type: ADD_TRACK,
      name,
      segments
    }
    const result = tactions.addTrack(segments, name)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  it('should create an action to toggle track renaming', () => {
    const trackId = 1
    const expectedAction = {
      type: TOGGLE_TRACK_RENAMING,
      trackId
    }
    const result = tactions.toggleTrackRenaming(trackId)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  it('should create an action to update the track name', () => {
    const trackId = 1
    const name = 'trackA'
    const expectedAction = {
      type: UPDATE_TRACK_NAME,
      name,
      trackId
    }
    const result = tactions.updateTrackName(trackId, name)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })
})
