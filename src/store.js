import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'

import { createStore, applyMiddleware } from 'redux'
import reducers from './reducers'
import { Map } from 'immutable'

const actionsToNotLog = new Set(['DEHIGHLIGHT_SEGMENT', 'HIGHLIGHT_SEGMENT'])

const loggerMiddleware = createLogger({
  stateTransformer: (state) => state.toJS(),
  predicate: (getState, action) => !actionsToNotLog.has(action.type)
})

let store = createStore(
  reducers,
  Map({}),
  process.env.NODE_ENV === 'development' ? applyMiddleware(thunkMiddleware, loggerMiddleware) : applyMiddleware(thunkMiddleware)
)

import { requestServerState } from 'actions/progress'
if (!process.env.BUILD_GPX) {
  store.dispatch(requestServerState())
}

export default store
