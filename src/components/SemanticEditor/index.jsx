import React, { Component } from 'react'
import { detect } from 'async'
import { convertToRaw, SelectionState, Modifier, Entity, Editor, EditorState, CompositeDecorator, ContentState } from 'draft-js'
import LIFEParser from 'components/utils/life.peg.js'

import SuggestionBox from 'components/SuggestionBox.jsx'

import findSuggestions from '../utils/findSuggestions'
import completeWithSuggestion from '../utils/completeWithSuggestion'
import findSuggestionBoxPosition from '../utils/findSuggestionBoxPosition'

class SemanticEditor extends Component {
  constructor (props) {
    super(props)
    const decorator = new CompositeDecorator(props.strategies)

    const { initial } = props
    this.state = {
      editorState: EditorState.createWithContent(initial, decorator),
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

  componentDidUpdate (prev) {
    //console.log('now', this.props.initial.getPlainText())
    //console.log('prev', prev.initial.getPlainText())
    if (prev.initial !== this.props.initial) {
      console.log('updated!')
      const state = EditorState.push(this.state.editorState, this.props.initial, 'insert-characters')
      this.onChange(state)
    }
  }

  onChange (editorState, hide = false) {
    const sel = editorState.getSelection()
    const startKey = sel.getStartKey()
    const index = sel.get('focusOffset')
    let content = editorState.getCurrentContent()
    const lineKey = content.getBlockMap().keySeq()
    const block = content.getBlockForKey(startKey)

    const blockText = block.getText()
    const line = lineKey.findIndex((lk) => lk === startKey)

    try {
      const parts = LIFEParser.parse(blockText)
      console.log(parts)
      const processPart = (part) => {
        if (part.values) {
          part.forEach((p) => processPart(p))
        } else {
          switch (part.type) {
            case 'Trip':
              processPart(part.timestamp)
              processPart(part.locationFrom)
              processPart(part.locationTo)
              part.details.forEach((d) => processPart(d))
              break
            case 'Tag':
            case 'Timespan':
            case 'LocationFrom':
            case 'Location':
              const sel = new SelectionState({
                focusKey: startKey,
                focusOffset: part.offset + part.length,
                anchorKey: startKey,
                anchorOffset: part.offset
              })
              const ekey = Entity.create('TSPAN', 'MUTABLE', {})
              console.log('applying', sel.serialize(), ekey, part)
              content = Modifier.applyEntity(content, sel, ekey)
              break
          }
        }
      }

      const ts = new SelectionState({
        focusKey: startKey,
        focusOffset: blockText.length,
        anchorKey: startKey,
        anchorOffset: 0
      })
      content = Modifier.applyEntity(content, ts, null)

      processPart(parts)
      editorState = EditorState.push(editorState, content, 'apply-entity')
      console.log(sel.serialize())
      editorState = EditorState.acceptSelection(editorState, sel)

      console.log(editorState.getCurrentContent().getBlockMap().valueSeq().toJS())
    } catch (e) {
      console.log(blockText)
      console.log(e)
    }

    const entityKey = block.getEntityAt(index)
    const shouldShow = sel.getHasFocus()

    const contentText = content.getPlainText('\n')

    this.state.editorState = editorState
    this.setState(this.state)

      /*
    if (entityKey !== null && Entity.get(entityKey)) {
      const entity = Entity.get(entityKey)
      const type = entity.getType()

      const text = entity.getData().text
      const suggestionGetter = this.props.suggestionGetters[type]
      if (suggestionGetter) {
        const { getter, setter } = suggestionGetter
        this.state.editorState = editorState
        this.setState(this.state)

        getter(text, entity.getData(), (suggestions) => {
          if (this.state.editorState === editorState) {
            const show = hide ? false : (suggestions.length > 0)
            let ranges = []
            block.findEntityRanges((c) => c.getEntity() === entityKey, (begin, end) => ranges.push({ begin, end }))
            const { begin, end } = ranges[0]

            this.setState({
              editorState,
              suggestions: {
                show,
                list: suggestions,
                selected: -1,
                box: findSuggestionBoxPosition(this.refs.editor, this.state.suggestions.box),
                setter,
                data: entity.getData(),
                details: { begin, end }
                //tab: tabCompletion
              }
            })
          } else {
            this.state.editorState = editorState
            this.state.suggestions.show = false
            this.setState(this.state)
          }
        })
      } else {
        this.state.editorState = editorState
        this.state.suggestions.show = false
        this.setState(this.state)
      }
    } else {
      this.state.editorState = editorState
      this.state.suggestions.show = false
      this.setState(this.state)
    }
    */

    /*
    const blockMap = content.getBlockMap()
    const blockSeq = blockMap.entrySeq()
    const line = blockSeq.findIndex(([i, _]) => (i === startKey))
    const text = block.getText()

    const stateInfo = {
      text,
      line,
      index,
      block,
      all: content.getPlainText()
    }

    findSuggestions(text, index, this.props.strategies, (result) => {
      if (this.state.editorState === editorState) {
        const { strategy, suggestions, begin, end } = result
        const tabCompletion = strategy ? strategy.tabCompletion : null
        const show = hide ? false : (suggestions.length > 0)

        this.setState({
          editorState,
          suggestions: {
            show,
            list: suggestions,
            selected: -1,
            box: findSuggestionBoxPosition(this.refs.editor, this.state.suggestions.box),
            details: { begin, end },
            tab: tabCompletion
          }
        })
      } else {
        this.state.suggestions.show = false
        this.setState(this.state)
      }
    }, stateInfo)
    this.props.onChange(contentText)
    */
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
    const { data, setter } = this.state.suggestions
    setter(suggestion, data)
    //let { begin, end } = this.state.suggestions.details
    //const newEditorState = completeWithSuggestion(this.state.editorState, suggestion, begin, end)
    //this.onChange(newEditorState, true)
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

  onEsc () {
    if (this.state.suggestions.show) {
      console.log('Handling esc')
      this.state.suggestions.show = false
      this.setState(this.state)
    }
  }

  render () {
    const { className } = this.props
    const { editorState, suggestions } = this.state
    const { selected, list, show, box: { left, top } } = suggestions

    return (
      <div style={{ fontFamily: 'monospace', width: '100%' }} className={className}>
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
