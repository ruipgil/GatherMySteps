import expect from 'expect'
import {
  ADD_SEGMENT_POINT
} from '../../src/actions'
import * as actions from '../../src/actions/segments'

describe('segments', () => {
  it('should create an action to a point to a segment', () => {
    const lat = 983.983
    const lon = -21.231
    const index = 17
    const segmentId = 19

    const expectedAction = {
      lat,
      lon,
      index,
      segmentId,
      type: ADD_SEGMENT_POINT
    }

    const result = actions.addSegmentPoint(segmentId, index, lat, lon)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

})
