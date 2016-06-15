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
      //console.log('updated!')
      const state = EditorState.push(this.state.editorState, this.props.initial, 'insert-characters')
      this.onChange(state)
    }
  }

  onChange (editorState, hide = false) {
    const sel = editorState.getSelection()
    const startKey = sel.getStartKey()
    const index = sel.getStartOffset()
    let content = editorState.getCurrentContent()
    const lineKey = content.getBlockMap().keySeq()
    const line = lineKey.findIndex((lk) => lk === startKey)
    const block = content.getBlockForKey(startKey)

    const blockText = block.getText()

    if (content.getPlainText() !== this.state.editorState.getCurrentContent().getPlainText()) {

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
                const ekey = Entity.create(part.type, 'MUTABLE', { value: part.value, segment: segs.get(n), dispatch: this.props.dispatch, modeId })
                //console.log('applying', _sel.serialize(), ekey, part, start, end, blockText.slice(start, end), blockText.length)
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

        //console.log(startKey)
        processPart(parts)
        editorState = EditorState.push(editorState, content, 'apply-entity')
        //console.log(sel.serialize())

        //const nlineKey = content.getBlockMap().keySeq()
        //const nline = nlineKey.find((lk) => lk === startKey)
        //const upSel = new SelectionState({
          //focusKey: nline,
          //focusOffset: index,
          //anchorKey: nline,
          //anchorOffset: index
        //})
        //console.log(sel.serialize(), upSel.serialize())
        editorState = EditorState.forceSelection(editorState, sel)

        //console.log(editorState.getCurrentContent().getBlockMap().valueSeq().toJS())
      } catch (e) {
        console.log(blockText)
        console.error(e)
      }
    }

    let entityKey = block.getEntityAt(index)
    const shouldShow = sel.getHasFocus()

    const contentText = content.getPlainText('\n')
    //console.log(contentText)

    const saveState = () => {
      this.state.editorState = editorState
      this.state.suggestions.show = false
      this.setState(this.state)
    }

    console.log(entityKey)
    if (entityKey === null && index > 0) {
      entityKey = block.getEntityAt(index - 1)
    }
    if (entityKey !== null && Entity.get(entityKey)) {
      console.log('null entity')
      const entity = Entity.get(entityKey)
      const type = entity.getType()

      const text = entity.getData().text
      const suggestionGetter = this.props.suggestionGetters[type]
      if (suggestionGetter) {
        console.log('no getter')
        const { getter, setter } = suggestionGetter

        getter(text, entity.getData(), (suggestions) => {
          console.log('getter said', suggestions)
          //if (this.state.editorState === editorState) {
            const show = hide ? false : (suggestions.length > 0)
            console.log('showing', suggestions)
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
          //} else {
            //saveState()
          //}
        })
      } else {
        saveState()
      }
    } else {
      saveState()
    }

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
    //const { tab } = this.state.suggestions
    //if (tab) {
      //const newEditorState = tab(this.state.editorState)
      //if (newEditorState) {
        //this.onChange(newEditorState)
      //}
    //}
    e.preventDefault()
    const { editorState } = this.state

    const sel = editorState.getSelection()
    const startKey = sel.getStartKey()
    const sindex = sel.getStartOffset()
    let content = editorState.getCurrentContent()
    const lineKey = content.getBlockMap().keySeq()
    const line = lineKey.findIndex((lk) => lk === startKey)
    const block = content.getBlockForKey(startKey)

    const findBlockEntities = (block) => {
      let ranges = []
      block.findEntityRanges((c) => c.getEntity() !== null, (begin, end) => ranges.push({ begin, end }))
      return ranges
    }

    lineKey.slice(line).find((lk) => {
      const block = content.getBlockForKey(lk)
      console.log(lk, block.getText())
      const index = lk === startKey ? sindex : 0
      let ranges = findBlockEntities(block)
      console.log(ranges, index)
      const range = ranges.find((range) => range.begin > index)
      console.log(range)

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
