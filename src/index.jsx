import './main.css'
import '../node_modules/leaflet/dist/leaflet.css'
import '../node_modules/font-awesome/css/font-awesome.css'
import '../node_modules/bulma/css/bulma.css'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import store from 'store'

import App from './containers/App.jsx'
render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('container'))
