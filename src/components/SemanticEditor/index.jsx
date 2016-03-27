import React, { Component } from 'react'
import { Editor, EditorState, CompositeDecorator } from 'draft-js'

import SuggestionBox from 'components/SuggestionBox.jsx'

import findSuggestions from '../utils/findSuggestions'
import completeWithSuggestion from '../utils/completeWithSuggestion'
import findSuggestionBoxPosition from '../utils/findSuggestionBoxPosition'

class SemanticEditor extends Component {
  constructor (props) {
    super(props)
    const decorator = new CompositeDecorator(props.strategies)

    this.state = {
      editorState: EditorState.createEmpty(decorator),
      suggestions: {
        show: false,
        list: [],
        selected: -1,
        box: { left: 0, top: 0 },
        details: { begin: 0, end: 0 },
        tab: () => {}
      }
    }
  }

  focus () {
    this.refs.editor.focus()
  }

  onChange (editorState, hide = false) {
    const sel = editorState.getSelection()
    const index = sel.get('focusOffset')
    const text = editorState.getCurrentContent().getLastBlock().getText().slice(0, index)

    this.state.editorState = editorState
    this.setState(this.state)

    findSuggestions(text, this.props.strategies, (result) => {
      if (this.state.editorState === editorState) {
        const { strategy, suggestions, begin, end } = result
        const tabCompletion = strategy ? strategy.tabCompletion : null
        this.setState({
          editorState,
          suggestions: {
            show: hide ? false : (suggestions.length > 0),
            list: suggestions,
            selected: -1,
            box: findSuggestionBoxPosition(this.refs.editor, this.state.sugBox),
            details: { begin, end },
            tab: tabCompletion
          }
        })
      } else {
      }
    })
  }

  onUpArrow (e) {
    let { list, selected, show } = this.state.suggestions

    if (show) {
      e.preventDefault()
      this.state.suggestions.selected = Math.abs(selected - 1) % list.length
      this.setState(this.state)
    }
  }

  onDownArrow (e) {
    let { list, selected, show } = this.state.suggestions

    if (show) {
      e.preventDefault()
      this.state.suggestions.selected = Math.abs(selected + 1) % list.length
      this.setState(this.state)
    }
  }

  onReturn (e) {
    let { list, selected } = this.state.suggestions
    if (selected >= 0) {
      this.onSuggestionSelect(list[selected])
      return true
    } else {
      return false
    }
  }

  onSuggestionSelect (suggestion) {
    let { begin, end } = this.state.suggestions.details
    const newEditorState = completeWithSuggestion(this.state.editorState, suggestion, begin, end)
    this.onChange(newEditorState, true)
  }

  onTab (e) {
    e.preventDefault()
    const { tab } = this.state.suggestions
    if (tab) {
      const newEditorState = tab(this.state.editorState)
      if (newEditorState) {
        this.onChange(newEditorState)
      }
    }
  }

  render () {
    const { className } = this.props
    const { editorState, suggestions } = this.state
    const { selected, list, show, details: { left, top } } = suggestions

    return (
      <div style={{ fontFamily: 'monospace' }} className={className}>
        <Editor
          editorState={editorState}
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
          show={show}
          selected={selected}
          onSelect={this.onSuggestionSelect.bind(this)}
          suggestions={list}
        />
      </div>
    )
  }
}

export default SemanticEditor
