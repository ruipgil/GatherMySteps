import { connect } from 'react-redux'
import PerfMap from 'components/PerfMap'

const mapStateToProps2 = (state) => {
  return {
    map: state.get('ui').get('map'),
    bounds: state.get('ui').get('bounds'),
    segments: state.get('tracks').get('segments'),
    details: state.get('ui').get('details')
  }
}

const LeafletMap = connect(mapStateToProps2)(PerfMap)

export default LeafletMap
