import './main.css'
import '../node_modules/leaflet/dist/leaflet.css'

import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import App from './containers/App.jsx'
import reducers from './reducers'
import { Map } from 'immutable'

let store = createStore(reducers, Map({}))

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('container'))
