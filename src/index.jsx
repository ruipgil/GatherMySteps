import './main.css'
import '../node_modules/leaflet/dist/leaflet.css'
import React from 'react'
import { render } from 'react-dom';
import App from './App.jsx'

import { createStore } from 'redux'
import reducers from './trackStore.jsx'
import { Provider } from 'react-redux'

let store = createStore(reducers)

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('container'));
