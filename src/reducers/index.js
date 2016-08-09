import { combineReducers } from 'redux-immutable'
import ui from './ui'
import tracks from './tracks'
import progress from './progress'
import map from './map'

const app = combineReducers({
  tracks,
  ui,
  progress,
  map
})

export default app
