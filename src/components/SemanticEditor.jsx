import React from 'react'
import { connect } from 'react-redux'
import { convertFromRaw, Entity, ContentState, EditorState, Modifier } from 'draft-js'
import colors from 'reducers/colors'

import SemanticEditor from './SemanticEditor/index.jsx'

import addTextAt from './utils/addTextAt'
import findWithRegex from './utils/findWithRegex'
import generateTabFromSeparator from './utils/generateTabFromSeparator'

import LIFEParser from 'components/utils/life.peg.js'

import {
  updateLocationName,
  updateTransportationMode
} from 'actions/segments'

import {
  highlightSegment,
  dehighlightSegment
} from 'actions/ui'

const RegExStrategy = (regEx, captureGroup = 0, log = null) => {
  return (contentBlock, callback) => {
    findWithRegex(regEx, contentBlock, callback, captureGroup, log)
  }
}

const SemanticPill = (props) => {
  // <i className='fa fa-angle-down' style={{ fontSize: '1.2rem' }}/>
  console.log(props)
  return (
    <span className='tag is-info clickable' {...props}>{props.children}</span>
  )
}

let timeN = 0
const TimePill = (props) => {
  const n = timeN++
  const style = {
    borderLeft: colors(n) + ' 4px solid'
  }

  return (
    <span style={style} {...props}><span style={{ marginLeft: '5px' }} className='tag is-info clickable'>{props.children}</span></span>
  )
}

const TModeTimePill = (props) => {
  const n = timeN - 1
  const style = {
    borderLeft: colors(n) + ' 4px solid'
  }

  return (
    <span style={style} {...props}><span style={{ marginLeft: '5px' }} className='tag is-info clickable'>{props.children}</span></span>
  )
}

const PlaceFromPill = (props) => {
  const n = 0
  return (
    <SemanticPill onClick={ (e) => console.log('place', n, props.children) }>
      { props.children }
    </SemanticPill>
  )
}

let tagN = 0
const TagPill = (props) => {
  const n = tagN++
  return (
    <SemanticPill onClick={ (e) => console.log('tag', n, props.children) }>
      { props.children }
    </SemanticPill>
  )
}

const PLACES = [
  'home',
  'work',
  'school',
  'wife\'s work',
  'gym',
  'central park'
]
const PLACES_TO = [
  'home_',
  'work_',
  'school_',
  'wife\'s work_',
  'gym_',
  'central park_'
]
const TAGS = [
  'walk',
  'vehicle',
  'bike',
  'bus',
  'car',
  'train',
  'subway',
  'concert',
  'movies'
]
const SEMANTIC = [
  'Start Wars',
  'McDonalds',
  'AC/DC'
]

const suggestionRegExStrat = (re, captureGroup = 0) => {
  captureGroup++
  return (text, cursor) => {
    const match = re.exec(text)
    re.lastIndex = 0
    if (!match) {
      return null
    }
    let from = match.index
    for (let i = 1; i < captureGroup; i++) {
      from += match[i].length
    }
    let to = from + match[captureGroup].length
    if (from <= cursor && cursor <= to) {
      return {
        match,
        text: match[captureGroup],
        until: text.slice(from, cursor),
        from,
        to,
        cursor
      }
    }
  }
}

const queryTransportationSuggestion = (type, segment, name) => {
}

const queryPlaceFromSuggestion = (segmentId) => {
  const from = lastState.get(segmentId).get('locations').get(0)
  if (from) {
    return from.get('other').map((l) => l.get('label')).toJS()
  } else {
    return []
  }
}

const queryPlaceToSuggestion = (segmentId) => {
  const to = lastState.get(segmentId).get('locations').get(1)
  if (to) {
    return to.get('other').map((l) => l.get('label')).toJS()
  } else {
    return []
  }
}

const queryTransModeSuggestion = (segmentId, index) => {
  const tmodes = lastState.get(segmentId).get('transportationModes')
  if (tmodes) {
    return ['Hey', 'Walk bitch']
  } else {
    return []
  }
}

const stateSuggestionGetter = (state) => {
  return (matched, callback, details) => {
    const { text, id, line, all } = details
    let filtered = []
    let segIndex
    let segId

    switch (id) {
      case 'placeTo':
      case 'placeFrom':
        segIndex = all.split('\n').indexOf(text)
        segId = lastState.keySeq().get(segIndex)
        if (id === 'placeTo') {
          filtered = queryPlaceToSuggestion(segId)
        } else {
          filtered = queryPlaceFromSuggestion(segId)
        }
        break
      case 'tmode':
        const upUntil = all.split('\n').slice(0, line + 1)
        const segMarkers = upUntil.filter((s) => s.match(/^\d{4}-\d{4}/))
        segIndex = segMarkers.length - 1
        segId = lastState.keySeq().get(segIndex)
        const modeIndex = line - segIndex
        filtered = queryTransModeSuggestion(segId, modeIndex)
    }
    callback({
      suggestions: filtered,
      begin: matched.from,
      end: matched.to
    })
  }
}

const staticSuggestionGetter = (suggestions, offset = 1) => {
  return (matched, callback, details) => {
    let filtered = suggestions.filter((s) => s.match(matched.text))
    filtered = filtered.length === 0 ? suggestions : filtered
    filtered = filtered.filter((s) => s.toLowerCase() !== matched.text.toLowerCase())
    callback({
      suggestions: filtered,
      begin: matched.from,
      end: matched.to
    })
  }
}

const SuggestionsStrategies = [
  {
    id: 'hours',
    strategy: RegExStrategy(/^(\d{4}-\d{4})/g, 1),
    tabCompletion: generateTabFromSeparator(':'),
    component: TimePill
  },
  {
    id: 'tmodeHours',
    strategy: RegExStrategy(/^(\s+)(\d{4}-\d{4})/g, 2),
    tabCompletion: generateTabFromSeparator(':'),
    component: TModeTimePill
  },
  {
    id: 'placeFrom',
    suggestionStrategy: suggestionRegExStrat(/(^\d{4}-\d{4}\:\s*)([^\[\{\-\>]*)/g, 1),
    suggester: stateSuggestionGetter(),
    tabCompletion: generateTabFromSeparator('->'),
    strategy: RegExStrategy(/(\:\s*)([^\[\{\-\>]*)/g, 2),
    component: PlaceFromPill
  },
  {
    suggestionStrategy: suggestionRegExStrat(/(\-\>\s*)([^\[\{\-\>]*)$/g, 1),
    suggester: staticSuggestionGetter(PLACES_TO, 2),
    id: 'placeTo',
    strategy: RegExStrategy(/(\-\>\s*)([^\[\{\-\>]*)/g, 2),
    component: SemanticPill,
    tabCompletion: generateTabFromSeparator('', /(\-\>\s*)([^\[\{\-\>]*)/g, '[', 2)
  },
  {
    id: 'tmode',
    suggestionStrategy: suggestionRegExStrat(/(\[)([^\]]*)\]?/, 1),
    suggester: stateSuggestionGetter(),
    tabCompletion: generateTabFromSeparator(']', /\[([^\]]*)\]?/g, '{'),
    strategy: RegExStrategy(/\[([^\]]*)\]?/g),
    component: TagPill
  },
  {
    id: 'semantic',
    suggestionStrategy: suggestionRegExStrat(/(\{)([^\}]*)\}?/, 1),
    suggester: staticSuggestionGetter(SEMANTIC),
    tabCompletion: generateTabFromSeparator('}', /\{([^\}]*)\}?/g),
    strategy: RegExStrategy(/\{([^\}]*)\}?/g),
    component: SemanticPill
  }
]

const createRepresentation = (segments, dispatch) => {
  let entityMap = {}
  let blocks = []

  let c = 0
  const addToBlock = (block, text, type, data) => {
    const offset = block.text.length
    block.text += text
    if (type) {
      const key = type + '_' + (c++)
      entityMap[key] = {
        type,
        data: {
          text,
          ...data
        },
        mutability: 'MUTABLE'
      }
      block.entityRanges.push({ offset, length: text.length, key })
    }
  }

  const createBlock = () => ({
    text: '',
    type: 'unstyled',
    entityRanges: []
  })

  segments.forEach((segment, i) => {
    let block = createBlock()

    const start = segment.get('start')
    const end = segment.get('end')
    const from = segment.get('locations').get(0)
    const to = segment.get('locations').get(1)
    const transp = segment.get('transportationModes')

    const DATE_FORMAT = 'HHmm'
    const span = start.format(DATE_FORMAT) + '-' + end.format(DATE_FORMAT)

    addToBlock(block, span, 'TSPAN', { segment, dispatch })
    addToBlock(block, ': ')

    addToBlock(block, from.get('label'), 'PLACE_FROM', { segment, dispatch })

    if (to) {
      addToBlock(block, ' -> ')
      addToBlock(block, to.get('label'), 'PLACE_TO', { segment, dispatch })
    }

    if (transp) {
      if (transp.count() === 1) {
        addToBlock(block, ' [')
        addToBlock(block, transp.get('label'), 'TAG', { segment, dispatch })
        addToBlock(block, ']')

        blocks.push(block)
      } else {
        blocks.push(block)

        transp.forEach((t) => {
          const label = t.get('label')
          const points = segment.get('points')
          const from = points.get(t.get('from'))
          const to = points.get(t.get('to'))
          const tSpan = from.get('time').format(DATE_FORMAT) + '-' + to.get('time').format(DATE_FORMAT)
          block = createBlock()
          addToBlock(block, '    ')
          addToBlock(block, tSpan, 'TSPAN', { segment, dispatch })
          addToBlock(block, ': ')
          addToBlock(block, '[' + label + ']', 'TAG', { segment, dispatch, text: label })
          blocks.push(block)
        })
      }
    } else {
      blocks.push(block)
    }
  })
  return {
    blocks,
    entityMap
  }
}

const createStateTextRepresentation = (segments) => {
  let buff = []
  segments.forEach((segment) => {
    const start = segment.get('start')
    const end = segment.get('end')
    const from = segment.get('locations').get(0)
    const to = segment.get('locations').get(1)
    const transp = segment.get('transportationModes')

    const DATE_FORMAT = 'HHmm'
    const span = start.format(DATE_FORMAT) + '-' + end.format(DATE_FORMAT)

    let line = span + ': '
    line = line + from.get('label')
    if (to) {
      line = line + ' -> ' + to.get('label')
    }

    if (transp) {
      if (transp.count() === 1) {
        line = line + ' [' + transp.get('label') + ']'
      } else {
        const transports = transp.map((t) => {
          const label = t.get('label')
          const points = segment.get('points')
          const from = points.get(t.get('from'))
          const to = points.get(t.get('to'))
          const tSpan = from.get('time').format(DATE_FORMAT) + '-' + to.get('time').format(DATE_FORMAT)
          return '    ' + tSpan + ': [' + label + ']'
        }).toJS()

        line = line + '\n' + transports.join('\n')
      }
    }

    buff.push(line)
  })
  return buff.join('\n')
}

const getEntityStrategy = (type) => {
  return (contentBlock, callback) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity()
        if (entityKey === null) {
          return false
        }
        return Entity.get(entityKey).getType() === type
      },
      callback
    )
  }
}

const TimeSpan = (props) => {

  const onMouseEnter = () => {
    const { dispatch, segment } = Entity.get(props.entityKey).getData()
    dispatch(highlightSegment(segment.get('id')))
  }
  const onMouseLeave = () => {
    const { dispatch, segment } = Entity.get(props.entityKey).getData()
    dispatch(dehighlightSegment(segment.get('id')))
  }

  return (
    <span onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter} onClick={() => (console.log(Entity.get(props.entityKey).getData()))} className='clickable' style={{ backgroundColor: '#42afe3', color: 'white', padding: '3px 5px 3px 5px', borderRadius: '3px' }} {...props}>{props.children}</span>
  )
}

const decorator = [
  {
    strategy: getEntityStrategy('Timespan'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('LocationFrom'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('LocationTo'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('Location'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('Tag'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('Semantic'),
    component: TimeSpan
  }
]

const createPlaceSuggestions = (index) => (
  {
    getter: (text, data, callback) => {
      const from = data.segment.get('locations').get(index)
      if (from) {
        return callback(from.get('other').map((l) => l.get('label')).toJS())
      } else {
        return callback([])
      }
    },
    setter: (text, data) => {
      const { dispatch, segment } = data
      dispatch(updateLocationName(segment.get('id'), text, !index))
    }
  }
)

const suggestionGetters = {
  'Location': createPlaceSuggestions(1),
  'LocationTo': createPlaceSuggestions(1),
  'LocationFrom': createPlaceSuggestions(0),
  'Tag': {
    getter: (text, data, callback) => {
      const tmode = data.segment.get('transportationModes').get(data.modeId)
      const MODES = {
        '0': 'Stop',
        '1': 'Foot',
        '2': 'Vehicle'
      }
      if (tmode) {
        const list = tmode.get('classification').entrySeq().sort((a, b) => (a[1] < b[1])).map((v) => MODES[v[0]]).toJS()
        //console.log(list.toJS(), tmode.get('classification').entrySeq().toJS())
        return callback(list)
      } else {
        return []
      }
    },
    setter: (text, data) => {
      const { dispatch, segment } = data
      dispatch(updateTransportationMode(segment.get('id'), text, data.modeId))
    }
  }
}

let lastState
let SE = ({ dispatch, segments }) => {
  const state = ContentState.createFromText(createStateTextRepresentation(segments))
  const stateA = convertFromRaw(createRepresentation(segments, dispatch))

  console.log('rendering', segments.get(0).get('locations').get(0).get('label'))

  lastState = segments
  return (
    <SemanticEditor strategies={decorator} suggestionGetters={suggestionGetters} initial={ stateA } segments={ segments } dispatch={dispatch} onChange={(textState) => {
      timeN = 0
      tagN = 0

      //console.log(textState)
      //console.log(LIFEParser.parse(textState))

    }} textSegmenter={(textState) => {
      return LIFEParser.parse(textState)
    }}>
    </SemanticEditor>
  )
}

const mapStateToProps = (state) => {
  return {
    segments: state.get('tracks').get('segments')
  }
}

SE = connect(mapStateToProps)(SE)
export default SE
