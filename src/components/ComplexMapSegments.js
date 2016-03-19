import { MAP_STATES } from '../constants'
import EditableMapSegment from './EditableMapSegment.jsx'
import SplitableMapSegment from './SplitableMapSegment.jsx'
import JoinableMapSegment from './JoinableMapSegment.jsx'
import PointDetailMapSegment from './PointDetailMapSegment.jsx'

const ComplexMapSegments = (points, id, color, trackId, state, joinPossible, metrics, dispatch) => {
  switch (state) {
    case MAP_STATES.EDITING:
      return EditableMapSegment(points, trackId, id, color, dispatch)
    case MAP_STATES.SPLITING:
      return SplitableMapSegment(points, trackId, id, color, dispatch)
    case MAP_STATES.JOINING:
      return JoinableMapSegment(points, trackId, id, color, joinPossible, dispatch)
    case MAP_STATES.POINT_DETAILS:
      return PointDetailMapSegment(points, trackId, id, color, trackId, metrics.get('points'))
    default:
      return null
  }
}

export default ComplexMapSegments
