import './main.css'
import '../node_modules/leaflet/dist/leaflet.css'
import '../node_modules/font-awesome/css/font-awesome.css'

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
  applyMiddleware(thunkMiddleware, loggerMiddleware)
)

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('container'))
