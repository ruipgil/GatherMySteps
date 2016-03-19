import expect from 'expect'
import reducer from '../../src/reducers/tracks'
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

describe('tracks reducer', () => {
  beforeEach(() => clearIds())
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}).toJS()
    ).toEqual(
      {
        tracks: {},
        segments: {}
      })
  })

  it('should handle ADD_TRACK', () => {
    expect(
      reducer(fromJS({}), {
        type: types.ADD_TRACK,
        name: 'randomName',
        segments: [sampleSegment]
      }).toJS()
    ).toEqual(
      {
        tracks: {
          0: {
            id: 0,
            name: 'randomName',
            segments: [0],
            renaming: false
          }
        },
        segments: {
          0: {
            trackId: 0,
            id: 0,
            points: sampleSegment,
            display: true,
            start: sampleSegment[0].time,
            end: sampleSegment[sampleSegment.length - 1].time,
            color: colors(0),
            name: '',
            editing: false,
            spliting: false,
            joining: false,
            pointDetails: false,
            bounds: calculateBounds(sampleSegment),
            metrics: calculateMetrics(sampleSegment)
          }
        }
      }
    )
  })

    /*expect(
      reducer(
        [
          {
            text: 'Use Redux',
            completed: false,
            id: 0
          }
        ],
        {
          type: types.ADD_TODO,
          text: 'Run the tests'
        }
      )
    ).toEqual(
      [
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        },
        {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ]
    )
  })
  */
})
