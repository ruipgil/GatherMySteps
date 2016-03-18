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

const Hour = (props) => {
  return (
    <span className='semantic-pill is-info' {...props}>{props.children}<i className='fa fa-angle-down' /></span>
  )
}

const Strategies = [
  {
    strategy: HourStrategy,
    component: Hour
  },
  {
    strategy: PlaceStartStrategy,
    component: Hour
  },
  {
    strategy: PlaceEndStrategy,
    component: Hour
  },
  {
    strategy: SimpleTagStrategy,
    component: Hour
  },
  {
    strategy: SimpleSemanticStrategy,
    component: Hour
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
const TRANS = [
  'walk',
  'bike',
  'bus',
  'car',
  'train',
  'subway'
]

const SuggestionsStrategies = [
  {
    strategy: (text) => {
      const TAG_COMPLETION_REGEX = /\[([^\]]*)$/g
      const matched = TAG_COMPLETION_REGEX.exec(text)
      return matched
    },
    suggester: (matched) => {
      return {
        suggestions: PLACES.filter((s) => s.match(matched[1])),
        begin: matched.index + 1,
        end: matched.index + 1 + matched[1].length
      }
    }
  },
  {
    strategy: (text) => {
      const TAG_COMPLETION_REGEX = /\{([^\}]*)$/g
      const matched = TAG_COMPLETION_REGEX.exec(text)
      return matched
    },
    suggester: (matched) => {
      return {
        suggestions: TRANS.filter((s) => s.match(matched[1])),
        begin: matched.index + 1,
        end: matched.index + 1 + matched[1].length
      }
    }
  },
  {
    strategy: (text) => {
      const TAG_COMPLETION_REGEX = /\:\s*([^\[\{\-\>]*)$/g
      const matched = TAG_COMPLETION_REGEX.exec(text)
      return matched
    },
    suggester: (matched) => {
      return {
        suggestions: PLACES.filter((s) => s.match(matched[1])),
        begin: matched.index + 1,
        end: matched.index + 1 + matched[1].length
      }
    }
  },
  {
    strategy: (text) => {
      const TAG_COMPLETION_REGEX = /\-\>\s*([^\[\{\-\>]*)$/g
      const matched = TAG_COMPLETION_REGEX.exec(text)
      return matched
    },
    suggester: (matched) => {
      return {
        suggestions: PLACES.filter((s) => s.match(matched[1])),
        begin: matched.index + 2,
        end: matched.index + 2 + matched[1].length
      }
    }
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
    const { suggestions, begin, end } = findSuggestions(text, SuggestionsStrategies)

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
