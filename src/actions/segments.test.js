/* global describe, it */
import expect from 'expect'
import {
  ADD_SEGMENT_POINT,
  CHANGE_SEGMENT_POINT,
  EXTEND_SEGMENT_POINT
} from './'
import * as actions from './segments'

describe('segments', () => {
  it('should create an action to add point to a segment', () => {
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

  it('should create an action to change a point in a segment', () => {
    const lat = 983.983
    const lon = -21.231
    const index = 17
    const segmentId = 19

    const expectedAction = {
      lat,
      lon,
      index,
      segmentId,
      type: CHANGE_SEGMENT_POINT
    }

    const result = actions.changeSegmentPoint(segmentId, index, lat, lon)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  xit('should create an action to center map on point', () => {
  })

  it('should create an action to extend segment', () => {
    const lat = 983.983
    const lon = -21.231
    const index = 17
    const segmentId = 19

    const expectedAction = {
      lat,
      lon,
      index,
      segmentId,
      type: EXTEND_SEGMENT_POINT
    }

    const result = actions.extendSegment(segmentId, index, lat, lon)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  it('should create an action to join a segment to another', () => {
    const index = 17
    const details = 983.983
    const segmentId = 19

    const expectedAction = {
      details,
      index,
      segmentId,
      type: JOIN_SEGMENT
    }

    const result = actions.joinSegment(segmentId, index, details)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  it('should create an action to remove a segment', () => {
    const segmentId = 19

    const expectedAction = {
      segmentId,
      type: REMOVE_SEGMENT
    }

    const result = actions.removeSegment(segmentId, index)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  it('should create an action to remove a point from a segment', () => {
    const index = 17
    const segmentId = 19

    const expectedAction = {
      index,
      segmentId,
      type: REMOVE_SEGMENT_POINT
    }

    const result = actions.removeSegmentPoint(segmentId, index)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  it('should create an action to split a segment', () => {
    const index = 17
    const segmentId = 19

    const expectedAction = {
      index,
      segmentId,
      type: SPLIT_SEGMENT
    }

    const result = actions.splitSegment(segmentId, index)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  it('should create an action to update time filter of a segment', () => {
    const lower = 32
    const upper = 88
    const segmentId = 19

    const expectedAction = {
      lower,
      upper,
      type: UPDATE_TIME_FILTER_SEGMENT
    }

    const result = actions.updateTimeFilterSegment(segmentId, lower, upper)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })

  it('should create an action to toggleTimeFilter', () => {
    const segmentId = 19

    const expectedAction = {
      type: TOGGLE_TIME_FILTER
    }

    const result = actions.toggleTimeFilter(segmentId)
    expect(result).toEqual(expectedAction)
    expect(result.type).toExist()
  })
})
