import React from 'react'
import { Component } from 'react'
import { CompositeDecorator, Editor, EditorState, Modifier } from 'draft-js'

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
  return (text) => re.exec(text)
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

const addTextAt = (editorState, text, index) => {
  const sel = editorState.getSelection().merge({
    anchorOffset: index,
    focusOffset: index
  })
  const closeTagReplacedContent = Modifier.replaceText(
    editorState.getCurrentContent(),
    sel,
    text,
    null,
    null
  )

  const newEditorState = EditorState.push(
    editorState,
    closeTagReplacedContent,
    'complete-place-from'
  )
  return EditorState.forceSelection(newEditorState, closeTagReplacedContent.getSelectionAfter())
}

const cursorAt = (editorState, index) => {
  const newSel = editorState.getSelection().merge({
    anchorOffset: index,
    focusOffset: index
  })
  return EditorState.forceSelection(editorState, newSel)
}
const removeTextAt = (editorState, from, to) => {
  const range = editorState.getSelection().merge({
    anchorOffset: from,
    focusOffset: to
  })

  let newContent = Modifier.removeRange(
    editorState.getCurrentContent(),
    range,
    null
  )

  const newEditorState = EditorState.push(
    editorState,
    newContent,
    'remove-span-arrow'
  )
  return EditorState.forceSelection(newEditorState, newContent.getSelectionAfter())
}

const SuggestionsStrategies = [
  {
    strategy: suggestionRegExStrat(/\[([^\]]*)\]?/),
    suggester: staticSuggestionGetter(TAGS),
    id: 'tags',
    tabCompletion: (editorState) => {
      const sel = editorState.getSelection()
      const index = sel.get('focusOffset')

      const text = editorState.getCurrentContent().getLastBlock().getText()
      const right = text.slice(index)

      let closeMatch = right.match(/]/)
      if (closeMatch) {
        // Position cursor at the end
        const toIndex = closeMatch.index + index + 1
        return cursorAt(editorState, toIndex)
      } else {
        const RE = /\[([^\]]*)\]?/g
        const e = RE.exec(text)
        console.log(e)
        if (e && e[1].trim() === '') {
          // Remove [, it's an empty tag
          return removeTextAt(editorState, e.index, e.index + e.length)
        } else if (e && e[0].trim().match(/\]$/)) {
          // Add {
          return addTextAt(editorState, '{', index)
        } else {
          // Add ]
          return addTextAt(editorState, ']', index)
        }
      }
    }
  },
  {
    strategy: suggestionRegExStrat(/\{([^\}]*)$/),
    suggester: staticSuggestionGetter(SEMANTIC),
    id: 'semantic',
    tabCompletion: (editorState) => {
      const sel = editorState.getSelection()
      const index = sel.get('focusOffset')

      const text = editorState.getCurrentContent().getLastBlock().getText()
      const right = text.slice(index)

      let closeMatch = right.match(/}/)
      if (closeMatch) {
        // Position cursor at the end
        const toIndex = closeMatch.index + index + 1
        return cursorAt(editorState, toIndex)
      } else {
        const RE = /\{([^\}]*)\}?/g
        const e = RE.exec(text)
        if (e && e[1].trim() === '') {
          // Remove {, it's an empty semantic
          return removeTextAt(editorState, e.index, e.index + e.length)
        } else {
          // Add }
          return addTextAt(editorState, '}', index)
        }
      }
    }
  },
  {
    strategy: suggestionRegExStrat(/\:\s*([^\[\{\-\>]*)$/),
    suggester: staticSuggestionGetter(PLACES),
    id: 'placeFrom',
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
  },
  {
    strategy: suggestionRegExStrat(/\-\>\s*([^\[\{\-\>]*)$/),
    suggester: staticSuggestionGetter(PLACES_TO, 2),
    id: 'placeTo',
    tabCompletion: (editorState) => {
      const sel = editorState.getSelection()
      const index = sel.get('focusOffset')

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
      /*
      let closeMatch = right.match(/[\[\{]|$/)
      console.log(closeMatch)
      if (closeMatch) {
        // Position cursor at the end
        const toIndex = closeMatch.index + index

        const newSel = sel.merge({
          anchorOffset: toIndex,
          focusOffset: toIndex
        })
        const newState = EditorState.forceSelection(editorState, newSel)

        return newState
      } else {
        // Add ]

        let closeTagReplacedContent = Modifier.replaceText(
          editorState.getCurrentContent(),
          sel,
          '[',
          null,
          null
        )

        const newEditorState = EditorState.push(
          editorState,
          closeTagReplacedContent,
          'complete-place-from'
        )
        const newState = EditorState.forceSelection(newEditorState, closeTagReplacedContent.getSelectionAfter())

        return newState
      }
      */
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

    this.state.editorState = editorState
    this.setState(this.state)

    findSuggestions(text, SuggestionsStrategies, (result) => {
      if (this.state.editorState === editorState) {
        const { strategy, suggestions, begin, end } = result
        const tabCompletion = strategy ? strategy.tabCompletion : null
        this.setState({
          editorState,
          suggestions,
          tabCompletion,
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

  onTab (e) {
    e.preventDefault()
    if (this.state.tabCompletion) {
      const newEditorState = this.state.tabCompletion(this.state.editorState)
      if (newEditorState) {
        this.onChange(newEditorState)
      }
    }
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
          onTab={this.onTab.bind(this)}
          ref='editor'
          spellcheck={false}
        />
        <SuggestionBox
          left={left}
          top={top}
          show={this.state.suggestions.length > 0}
          selected={sugSelected}
          onSelect={this.onSuggestionSelect.bind(this)}
          suggestions={suggestions}
        />
      </div>
    )
  }
}

export default SemanticEditor
