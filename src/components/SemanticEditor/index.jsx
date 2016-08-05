import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { Editor, Modifier, CompositeDecorator, EditorState, SelectionState } from 'draft-js'
import suggest from './suggest'
import decorate from './decorate'
import { selectNextEntity } from './selectNextEntity'
import SuggestionBox from 'components/SuggestionBox.jsx'

class SemanticEditor extends Component {
  constructor (props) {
    super(props)
    this.previousAst = null
    this.warning = null
    this.timeout = null

    const { state, strategies } = this.props
    const decorator = new CompositeDecorator(strategies)
    const editorState = this.decorate(EditorState.createWithContent(state, decorator))

    this.state = {
      editorState,
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

  componentDidUpdate (prev, prevState) {
    if (prev.initial !== this.props.initial) {
      const state = EditorState.push(this.state.editorState, this.props.initial, 'insert-characters')
      this.onChange(state)
    } else if (prev.segments !== this.props.segments) {
      const editorState = this.decorate(this.state.editorState)
      this.setState({editorState, suggestions: this.state.suggestions})
    }
  }

  decorate (editorState) {
    let warning
    [editorState, this.previousAst, warning] = decorate(this.previousAst, editorState, this.props.segments, this.props.dispatch)
    if (warning) {
      this.warning = warning
    } else {
      this.warning = null
    }
    return editorState
  }

  suggest (editorState) {
    suggest(editorState, this.props.suggestionGetters, (suggestions) => {
      if (this.state.editorState === editorState) {
        this.setState({ editorState, suggestions })
      }
    }, this.refs, this.state.suggestions)
  }

  onChange (editorState) {
    const previousText = this.state.editorState.getCurrentContent().getPlainText()
    const currentText = editorState.getCurrentContent().getPlainText()

    this.setState({editorState, suggestions: this.state.suggestions})

    if (previousText === currentText) {
      this.suggest(editorState)
      return
    }

    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(() => {
      editorState = this.decorate(editorState)
      this.setState({editorState, suggestions: this.state.suggestions})
      this.timeout = null
    }, 100)
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
    const { editorState, suggestions } = this.state
    const { details } = this.state.suggestions

    let range = SelectionState.createEmpty(details.key)
    range = range.merge({
      anchorOffset: details.begin,
      focusOffset: details.end
    })
    let content = editorState.getCurrentContent()
    content = Modifier.replaceText(content, range, suggestion)
    // TODO replace value in entity
    let newEditorState = this.decorate(EditorState.push(editorState, content, 'insert-characters'))
    const sl = editorState.getSelection().merge({
      hasFocus: false
    })
    newEditorState = EditorState.acceptSelection(newEditorState, sl)
    suggestions.show = false
    this.setState({
      editorState: newEditorState,
      suggestions
    })
  }

  onTab (e) {
    e.preventDefault()
    const backwards = e.shiftKey
    let { editorState } = this.state
    this.onChange(selectNextEntity(editorState, backwards))
  }

  onEsc () {
    if (this.state.suggestions.show) {
      this.state.suggestions.show = false
      this.setState(this.state)
    }
  }

  render () {
    const { editorState, suggestions } = this.state
    const { selected, list, show, box: { left, top } } = suggestions
    return (
      <div style={{ display: 'flex', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex' }}>
          <ol style={{ paddingRight: '6px' }}>
            {
              editorState.getCurrentContent().getBlockMap().keySeq().map((blockKey, i) => {
                const block = document.querySelector('[data-offset-key="' + blockKey + '-0-0"][data-block=true]')
                const stl = {}
                if (block) {
                  stl.height = block.offsetHeight + 'px'
                }
                i++
                return (
                  <li style={{ color: '#d3d6db', textAlign: 'right', ...stl }}>
                    {
                      this.warning && this.warning.location.start.line === i
                        ? <i className='fa fa-warning' style={{ color: '#fcda73' }} title={this.warning.message} />
                        : i
                    }
                  </li>
                )
              })
            }
          </ol>
        </div>
        <div style={{ display: 'flex' }}>
          <Editor
            editorState={editorState}
            onChange={this.onChange.bind(this)}
            stripPastedStyles={true}
            onDownArrow={this.onDownArrow.bind(this)}
            onUpArrow={this.onUpArrow.bind(this)}
            handleReturn={this.onReturn.bind(this)}
            onEscape={this.onEsc.bind(this)}
            onTab={this.onTab.bind(this)}
            ref='editor'
            spellcheck={false}
          />
        </div>
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
