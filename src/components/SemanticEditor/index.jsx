import React, { Component } from 'react'
import {
  SelectionState,
  Modifier,
  Entity,
  Editor,
  EditorState,
  CompositeDecorator
} from 'draft-js'
import LIFEParser from 'components/utils/life.peg.js'

import SuggestionBox from 'components/SuggestionBox.jsx'

// import findSuggestions from '../utils/findSuggestions'
// import completeWithSuggestion from '../utils/completeWithSuggestion'
import findSuggestionBoxPosition from '../utils/findSuggestionBoxPosition'

class SemanticEditor extends Component {
  constructor (props) {
    super(props)

    const { state, strategies } = this.props
    const decorator = new CompositeDecorator(strategies)
    const editorState = EditorState.createWithContent(state, decorator)

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

    this.onChange(editorState, false, true)
  }

  focus () {
    this.refs.editor.focus()
  }

  componentDidUpdate (prev) {
    if (prev.initial !== this.props.initial) {
      const state = EditorState.push(this.state.editorState, this.props.initial, 'insert-characters')
      this.onChange(state)
    }
  }

  decorateState (editorState, force) {
    const sel = editorState.getSelection()
    const startKey = sel.getStartKey()
    let content = editorState.getCurrentContent()
    const lineKey = content.getBlockMap().keySeq()
    const block = content.getBlockForKey(startKey)
    const blockText = block.getText()

    const current = this.state.editorState.getCurrentContent().getPlainText()
    const next = content.getPlainText()
    if (force || current !== next) {
      const segs = this.props.segments.toList()

      try {
        const parts = LIFEParser.parse(content.getPlainText())
        const processPart = (part, n, modeId) => {
          if (!part) {
            return
          }

          if (part.values) {
            part.forEach((p, i) => processPart(p, i))
          } else {
            switch (part.type) {
              case 'Trip':
                processPart(part.timespan, n)
                processPart(part.locationFrom, n)
                processPart(part.locationTo, n)
                part.tmodes.forEach((d, i) => processPart(d, n, i))
                part.details.forEach((d) => processPart(d, n))
                break
              case 'TMode':
                processPart(part.timespan, n)
                part.details.forEach((d, i) => processPart(d, n, modeId))
                break
              case 'Tag':
              case 'Timespan':
              case 'LocationFrom':
              case 'Location':
                const start = part.offset
                const end = part.offset + part.length

                const _sel = new SelectionState({
                  anchorOffset: start,
                  anchorKey: lineKey.get(part.line),
                  focusKey: lineKey.get(part.line),
                  focusOffset: end,
                  isBackward: false,
                  hasFocus: false
                })
                const ekey = Entity.create(part.type, 'MUTABLE', {
                  value: part.value,
                  segment: segs.get(n),
                  dispatch: this.props.dispatch,
                  modeId
                })
                content = Modifier.applyEntity(content, _sel, ekey)
                break
            }
          }
        }

        const ts = sel.merge({
          focusOffset: blockText.length,
          anchorOffset: 0
        })
        content = Modifier.applyEntity(content, ts, null)

        processPart(parts)
        editorState = EditorState.push(editorState, content, 'apply-entity')
        editorState = EditorState.forceSelection(editorState, sel)
      } catch (e) {
        console.error(e)
      }
    }

    return editorState
  }

  onChange (editorState, hide = false, force = false) {
    const sel = editorState.getSelection()
    const startKey = sel.getStartKey()
    const index = sel.getStartOffset()
    let content = editorState.getCurrentContent()
    const block = content.getBlockForKey(startKey)

    let entityKey = block.getEntityAt(index)
    const shouldShow = sel.getHasFocus()

    const saveState = (es = editorState) => {
      this.state.editorState = es
      this.state.suggestions.show = false
      this.setState(this.state)
    }

    editorState = this.decorateState(editorState, force)
    saveState()

    // Allow suggestions when cursor is at an edge
    if (entityKey === null && index > 0) {
      entityKey = block.getEntityAt(index - 1)
    }
    if (entityKey !== null && Entity.get(entityKey)) {
      const entity = Entity.get(entityKey)
      const type = entity.getType()

      const text = entity.getData().text
      const suggestionGetter = this.props.suggestionGetters[type]
      if (suggestionGetter) {
        const { getter, setter } = suggestionGetter

        getter(text, entity.getData(), (suggestions) => {
          // if (this.state.editorState === editorState) {
          const show = hide ? false : (suggestions.length > 0) && shouldShow
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
            }
          })
          // } else {
            // saveState()
          // }
        })
      } else {
        saveState()
      }
    } else {
      saveState()
    }
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
  }

  onTab (e) {
    e.preventDefault()
    const { editorState } = this.state

    const sel = editorState.getSelection()
    const startKey = sel.getStartKey()
    const sindex = sel.getStartOffset()
    let content = editorState.getCurrentContent()
    const lineKey = content.getBlockMap().keySeq()
    const line = lineKey.findIndex((lk) => lk === startKey)

    const findBlockEntities = (block) => {
      let ranges = []
      block.findEntityRanges((c) => c.getEntity() !== null, (begin, end) => ranges.push({ begin, end }))
      return ranges
    }

    lineKey.slice(line).find((lk) => {
      const block = content.getBlockForKey(lk)
      const index = lk === startKey ? sindex : 0
      let ranges = findBlockEntities(block)
      const range = ranges.find((range) => range.begin > index)

      // found a next entity to jump
      if (range) {
        const newSel = sel.merge({
          anchorKey: lk,
          focusKey: lk,
          anchorOffset: range.begin,
          focusOffset: range.begin
        })
        const editorState = EditorState.forceSelection(this.state.editorState, newSel)
        this.onChange(editorState)

        return true
      } else {
        // if there are no tag or semantic information, initialize it
        // if there is but is empty, remove
      }

      return false
    })
  }

  onEsc () {
    if (this.state.suggestions.show) {
      this.state.suggestions.show = false
      this.setState(this.state)
    }
  }

  render () {
    const { className } = this.props
    const { editorState, suggestions } = this.state
    const { selected, list, show, box: { left, top } } = suggestions

    return (
      <div style={{ fontFamily: 'monospace', width: '100%', lineHeight: '170%' }} className={className}>
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
