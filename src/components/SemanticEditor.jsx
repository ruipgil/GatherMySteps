import React from 'react'
import { Component } from 'react'
import { CompositeDecorator, Editor, EditorState } from 'draft-js'

import SuggestionBox from './SuggestionBox.jsx'
import findWithRegex from './utils/findWithRegex'
import findSuggestions from './utils/findSuggestions'
import completeWithSuggestion from './utils/completeWithSuggestion'
import findSuggestionBoxPosition from './utils/findSuggestionBoxPosition'

const HOUR_REGEX = /^\d{4}-\d{4}/g
const HourStrategy = (contentBlock, callback) => {
  findWithRegex(HOUR_REGEX, contentBlock, callback, 0)
}

const PLACE_START_REGEX = /^(\d{4}-\d{4}:\s*)([^\[\{\>\-]+)/g
const PlaceStartStrategy = (contentBlock, callback) => {
  findWithRegex(PLACE_START_REGEX, contentBlock, callback, 2)
}

const PLACE_END_REGEX = /^(\d{4}-\d{4}:\s*[^\[\{\>\-]+\s*->\s*)([^\[\{\>\-]+\s*)/g
const PlaceEndStrategy = (contentBlock, callback) => {
  findWithRegex(PLACE_END_REGEX, contentBlock, callback, 2)
}

const SIMPLE_TAG_REGEX = /\[[^\]]*\]?/g
const SimpleTagStrategy = (contentBlock, callback) => {
  findWithRegex(SIMPLE_TAG_REGEX, contentBlock, callback, 0)
}
const SIMPLE_SEMANTICS_REGEX = /\{[^\}]*\}/g
const SimpleSemanticStrategy = (contentBlock, callback) => {
  findWithRegex(SIMPLE_SEMANTICS_REGEX, contentBlock, callback, 0)
}

const SemanticPill = (props) => {
  return (
    <span className='tag is-info' {...props}>{props.children}<i className='fa fa-angle-down' /></span>
  )
}

const Strategies = [
  {
    strategy: HourStrategy,
    component: SemanticPill
  },
  {
    strategy: PlaceStartStrategy,
    component: SemanticPill
  },
  {
    strategy: PlaceEndStrategy,
    component: SemanticPill
  },
  {
    strategy: SimpleTagStrategy,
    component: SemanticPill
  },
  {
    strategy: SimpleSemanticStrategy,
    component: SemanticPill
  }
]

const CDecorator = new CompositeDecorator(Strategies)

const PLACES = [
  'home',
  'work',
  'school',
  'wife\'s work',
  'gym',
  'central park'
]
const TAGS = [
  'walk',
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

const suggestionRegExStrat = (re) => {
  return (text) => {
    const matched = re.exec(text)
    return matched
  }
}

const staticSuggestionGetter = (suggestions, offset = 1) => {
  return (matched, callback) => {
    callback({
      suggestions: suggestions.filter((s) => s.match(matched[1])),
      begin: matched.index + offset,
      end: matched.index + offset + matched[1].length
    })
  }
}

const SuggestionsStrategies = [
  {
    strategy: suggestionRegExStrat(/\[([^\]]*)$/g),
    suggester: staticSuggestionGetter(TAGS)
  },
  {
    strategy: suggestionRegExStrat(/\{([^\}]*)$/g),
    suggester: staticSuggestionGetter(SEMANTIC)
  },
  {
    strategy: suggestionRegExStrat(/\:\s*([^\[\{\-\>]*)$/g),
    suggester: staticSuggestionGetter(PLACES)
  },
  {
    strategy: suggestionRegExStrat(/\-\>\s*([^\[\{\-\>]*)$/g),
    suggester: staticSuggestionGetter(PLACES, 2)
  }
]

class SemanticEditor extends Component {
  constructor () {
    super()

    this.state = {
      editorState: EditorState.createEmpty(CDecorator),
      suggestions: [],
      sugSelected: -1,
      details: {},
      sugBox: { left: 0, top: 0 }
    }
  }

  focus () {
    this.refs.editor.focus()
  }

  onChange (editorState) {
    const sel = editorState.getSelection()
    const index = sel.get('focusOffset')
    const text = editorState.getCurrentContent().getLastBlock().getText().slice(0, index)

    this.state.editorState = editorState
    this.setState(this.state)

    findSuggestions(text, SuggestionsStrategies, (result) => {
      if (this.state.editorState === editorState) {
        const { suggestions, begin, end } = result
        this.setState({
          editorState,
          suggestions,
          sugSelected: -1,
          details: {
            begin,
            end
          },
          sugBox: findSuggestionBoxPosition(this.refs.editor)
        })
      } else {
      }
    })
  }

  onUpArrow (e) {
    let state = this.state
    state.sugSelected = (state.sugSelected - 1) % state.suggestions.length
    this.setState(state)
  }

  onDownArrow (e) {
    let state = this.state
    state.sugSelected = (state.sugSelected + 1) % state.suggestions.length
    this.setState(state)
  }

  onReturn (e) {
    let state = this.state
    if (state.sugSelected >= 0) {
      let option = state.suggestions[state.sugSelected]
      this.onSuggestionSelect(option)
      return true
    } else {
      return false
    }
  }

  onSuggestionSelect (suggestion) {
    let { begin, end } = this.state.details
    const newEditorState = completeWithSuggestion(this.state.editorState, suggestion, begin, end)
    this.onChange(newEditorState)
  }

  render () {
    const { className } = this.props
    const { left, top } = this.state.sugBox
    const { sugSelected, suggestions } = this.state

    return (
      <div style={{ fontFamily: 'monospace' }} className={className}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange.bind(this)}
          stripPastedStyles={true}
          onDownArrow={this.onDownArrow.bind(this)}
          onUpArrow={this.onUpArrow.bind(this)}
          handleReturn={this.onReturn.bind(this)}
          ref='editor'
          spellcheck={false}
        />
        <SuggestionBox
          left={left}
          top={top}
          selected={sugSelected}
          onSelect={this.onSuggestionSelect.bind(this)}
          suggestions={suggestions}
        />
      </div>
    )
  }
}

export default SemanticEditor
