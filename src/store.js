import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'

import { createStore, applyMiddleware } from 'redux'
import reducers from './reducers'
import { Map } from 'immutable'

const loggerMiddleware = createLogger({
  stateTransformer: (state) => state.toJS()
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
