import { connect } from 'react-redux'
import PerfMap from 'components/PerfMap'

const mapStateToProps2 = (state) => {
  const history = state.get('tracks').get('history')
  return {
    map: state.get('ui').get('map'),
    bounds: state.get('ui').get('bounds'),
    center: state.get('ui').get('center'),
    highlighted: state.get('ui').get('highlighted'),
    segments: state.get('tracks').get('segments'),
    details: state.get('ui').get('details'),
    canUndo: history.get('past').count() !== 0,
    canRedo: history.get('future').count() !== 0
  }
}

const LeafletMap = connect(mapStateToProps2)(PerfMap)

export default LeafletMap
