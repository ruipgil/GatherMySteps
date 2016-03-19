import moment from 'moment'

import expect from 'expect'
import reducer from '../../src/reducers/segments'
import trackReducer from '../../src/reducers/tracks'
import { addTrack } from '../../src/actions/tracks'
import * as types from '../../src/actions'
import { reset as clearIds } from '../../src/reducers/idState'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { fromJS } from 'immutable'
import sampleSegment from '../sampleSegment'

import colors from '../../src/reducers/colors'
import { calculateMetrics, calculateBounds } from '../../src/reducers/utils'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

const stateWithOneTrack = () => {
    return trackReducer(fromJS({}), addTrack([sampleSegment], 'aName'))
}

const createSegmentObject = (trackId, id, points) => {
  return {
    trackId,
    id,
    points,
    display: true,
    start: points[0].time,
    end: points[points.length - 1].time,
    color: colors(id),
    name: '',
    editing: false,
    spliting: false,
    joining: false,
    pointDetails: false,
    bounds: calculateBounds(points),
    metrics: calculateMetrics(points)
  }
}

describe('segments reducer', () => {
  beforeEach(() => clearIds())

  it('should return the initial state', () => {
    const initialState = stateWithOneTrack().setIn(['segments', 0, 'spliting'], true)
    const state = reducer(initialState, {
      type: types.SPLIT_SEGMENT,
      segmentId: 0,
      index: 2
    }).get('segments').toJS()

    let partTwo = sampleSegment.slice(2, 6)
    let partOne = sampleSegment.slice(0, 3)

    const comparePoints = (a, b) => {
      let fn = (p) => {
        if (p.time.unix) {
          p.time = p.time.unix()
        }
        return p
      }
      let _a = a.map(fn)
      let _b = b.map(fn)
      expect(a).toEqual(b)
    }

    const prepareSegmentsToCompare = (a) => {
      let fn = (p) => {
        p.time = p.time.unix()
        return p
      }
      a.points = a.points.map(fn)
      a.start = a.start.unix()
      a.end = a.end.unix()
      return a
    }

    comparePoints(state[0].points, createSegmentObject(0, 0, partOne).points)
    comparePoints(state[1].points, createSegmentObject(0, 1, partTwo).points)

  })
})
