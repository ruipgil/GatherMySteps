import { combineReducers } from 'redux-immutable'
import ui from './ui'
import tracks from './tracks'
import progress from './progress'

const app = combineReducers({
  tracks,
  ui,
  progress
})

export default app
