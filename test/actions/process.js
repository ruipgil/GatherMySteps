import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as processActions from '../../src/actions/progress'
import * as types from '../../src/actions'
import nock from 'nock'
import sampleSegment from '../sampleSegment'
import { fromJS } from 'immutable'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

xdescribe('async actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('creates REMOVE_TRACKS_FOR when done receiving server processing', (done) => {
    nock('http://example.com/')
      .post('/process')
      .reply(200, {
        body: {
          name: 'ANameForTheFile',
          segments: [
            {
              name: 'untitled',
              points: sampleSegment
           }
          ]
        }
      })

    const expectedActions = [
      { type: types.SEND_TRACK_TO_PROCESS },
      { type: types.REMOVE_TRACKS_FOR,
        body: {
          name: 'ANameForTheFile',
          segments: [
            {
              name: 'untitled',
              points: sampleSegment
            }
          ]
        }
      }
    ]
    const store = mockStore(fromJS({ progress: 0, tracks: { tracks: {}, segments: {} } }), expectedActions, done)
    store.dispatch(processActions.nextStep())
  })
})
