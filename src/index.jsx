import './main.css'
import '../node_modules/leaflet/dist/leaflet.css'
import '../node_modules/font-awesome/css/font-awesome.css'
import '../node_modules/bulma/css/bulma.css'

import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'

import App from './containers/App.jsx'
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

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('container'))
