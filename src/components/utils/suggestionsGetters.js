import {
  updateLocationName,
  updateTransportationMode,
  selectPointInMap,
  deselectPointInMap,
  getTransportationModesFor
} from 'actions/segments'

const filterSuggestions = (text, suggestions) => {
  let filtered = suggestions.filter((s) => s.match(text))
  filtered = filtered.filter((s) => s.toLowerCase() !== text.toLowerCase())
  filtered = filtered.length === 0 ? suggestions : filtered
  filtered = filtered.filter((s) => s.toLowerCase() !== text.toLowerCase())
  return filtered
}

import {
  getLocationSuggestion
} from 'actions/progress'

const createPlaceSuggestions = (index) => (
  {
    type: 'TEXT',
    getter: (text, data, callback) => {
      const { dispatch, references } = data
      const refs = references.point ? references : (references.from || references.to)
      if (refs && refs.point) {
        dispatch(getLocationSuggestion(refs.point))
          .then((response) => callback(filterSuggestions(data.value, response)))
      }
      // getLocationSuggestion(references)
      // const from = data.segment.get('locations').get(index)
      // if (from) {
      //   return callback(filterSuggestions(data.value, from.get('other').map((l) => l.get('label')).toJS()))
      // } else {
      //   return callback([])
      // }
    },
    setter: (text, data) => {
      const { dispatch, segment } = data

      // dispatch(updateLocationName(segment.get('id'), text, !index))
    }
  }
)

export default {
  'Time': {
    type: 'DYNAMIC',
    getter: (text, data, callback) => {
      // const { dispatch, segment } = data
      // const id = segment.get('id')
      // dispatch(selectPointInMap(id, null, (ix, p) => {
      //   dispatch(deselectPointInMap(id))
      // }))
      // callback([])
    },
    setter: (text, data) => {},
    disposer: (data) => {
      // const { dispatch, segment } = data
      // dispatch(deselectPointInMap(segment.get('id')))
    }
  },
  'Location': createPlaceSuggestions(1),
  'LocationTo': createPlaceSuggestions(1),
  'LocationFrom': createPlaceSuggestions(0),
  'Tag': {
    type: 'TEXT',
    getter: (text, data, callback) => {
      const { dispatch, references } = data
      if (references) {
        const { segmentId, index } = references.from
        const list = dispatch(getTransportationModesFor(segmentId, index))
        const filtered = filterSuggestions(text, list)
        return callback(filtered)
      }
    },
    setter: (text, data) => {
      // const { dispatch, segment } = data
      // dispatch(updateTransportationMode(segment.get('id'), text, data.modeId))
    }
  }
}
