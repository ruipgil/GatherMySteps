import React from 'react'
import { connect } from 'react-redux'
import { EditorState, Modifier } from 'draft-js'

import SemanticEditor from './SemanticEditor/index.jsx'

import addTextAt from './utils/addTextAt'
import findWithRegex from './utils/findWithRegex'
import generateTabFromSeparator from './utils/generateTabFromSeparator'

const RegExStrategy = (regEx, captureGroup = 0, log = null) => {
  return (contentBlock, callback) => {
    findWithRegex(regEx, contentBlock, callback, captureGroup, log)
  }
}

const SemanticPill = (props) => {
  // <i className='fa fa-angle-down' style={{ fontSize: '1.2rem' }}/>
  return (
    <span className='tag is-info clickable' {...props}>{props.children}</span>
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

const staticSuggestionGetter = (suggestions, offset = 1) => {
  return (matched, callback) => {
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
    component: SemanticPill
  },
  {
    id: 'placeFrom',
    suggestionStrategy: suggestionRegExStrat(/(\:\s*)([^\[\{\-\>]*)/g, 1),
    suggester: staticSuggestionGetter(PLACES),
    tabCompletion: generateTabFromSeparator('->'),
    strategy: RegExStrategy(/(\:\s*)([^\[\{\-\>]*)/g, 2),
    component: PlaceFromPill
    /*
    tabCompletion: (editorState) => {
      const sel = editorState.getSelection()
      const index = sel.get('focusOffset')

      const text = editorState.getCurrentContent().getLastBlock().getText()
      const right = text.slice(index)

      let closeMatch = right.match(/->/)
      if (closeMatch) {
        // Position cursor at the end
        const toIndex = closeMatch.index + index + 2
        return cursorAt(editorState, toIndex)
      } else {
        // Add ->
        return addTextAt(editorState, '->', index)
      }
    }
    */
  },
  {
    suggestionStrategy: suggestionRegExStrat(/(\-\>\s*)([^\[\{\-\>]*)$/g, 1),
    suggester: staticSuggestionGetter(PLACES_TO, 2),
    id: 'placeTo',
    strategy: RegExStrategy(/(\-\>\s*)([^\[\{\-\>]*)/g, 2),
    component: SemanticPill,
    tabCompletion: generateTabFromSeparator('', /(\-\>\s*)([^\[\{\-\>]*)/g, '[', 2)
    /*tabCompletion: (editorState) => {
      const sel = editorState.getSelection()

      const text = editorState.getCurrentContent().getLastBlock().getText()

      const RE = /\-\>\s*([^\[\{\-\>]*)/g
      let match = RE.exec(text)
      if (match && match[1].trim() === '') {
        // Remove '->' & start tag

        const range = sel.merge({
          anchorOffset: match.index,
          focusOffset: match.index + match[0].length
        })

        let newContent = Modifier.replaceText(
          editorState.getCurrentContent(),
          range,
          ' [',
          null
        )

        const newEditorState = EditorState.push(
          editorState,
          newContent,
          'remove-span-arrow'
        )
        const newState = EditorState.forceSelection(newEditorState, newContent.getSelectionAfter())

        return newState
      } else if (match) {
        return addTextAt(editorState, ' [', match.index + match[0].length)
      }
      }*/
  },
  {
    id: 'tags',
    suggestionStrategy: suggestionRegExStrat(/(\[)([^\]]*)\]?/, 1),
    suggester: staticSuggestionGetter(TAGS),
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

let SE = ({ segments }) => {
  const state = createStateTextRepresentation(segments)
  return (
    <SemanticEditor strategies={SuggestionsStrategies} initial={ state } segments={ segments } onChange={() => { tagN = 0 } }>
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
