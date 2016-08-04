import React, { Component } from 'react'
import { Editor, Modifier, CompositeDecorator, EditorState, SelectionState } from 'draft-js'
import suggest from './suggest'
import decorate from './decorate'
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
      this.setState({ editorState, suggestions })
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
    const { data, setter, details } = this.state.suggestions
    // if (setter) {
    //   setter(suggestion, data)
    // }

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
    const { editorState, suggestions } = this.state
    const { selected, list, show, box: { left, top } } = suggestions
    return (
      <div>
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

// import React, { Component } from 'react'
// import {
//   SelectionState,
//   Modifier,
//   Entity,
//   Editor,
//   EditorState,
//   CompositeDecorator
// } from 'draft-js'
// import decorate from './decorate'
//
// import SuggestionBox from 'components/SuggestionBox.jsx'
//
// // import findSuggestions from '../utils/findSuggestions'
// // import completeWithSuggestion from '../utils/completeWithSuggestion'
// import findSuggestionBoxPosition from '../utils/findSuggestionBoxPosition'
//
// class SemanticEditor extends Component {
//   constructor (props) {
//     super(props)
//
//     const { state, strategies } = this.props
//     const decorator = new CompositeDecorator(strategies)
//     const editorState = EditorState.createWithContent(state, decorator)
//
//     this.state = {
//       editorState,
//       suggestions: {
//         show: false,
//         list: [],
//         selected: -1,
//         box: { left: 0, top: 0 },
//         details: { begin: 0, end: 0 },
//         tab: () => {}
//       }
//     }
//
//     this.onChange(editorState, false, true)
//     this.timer = setTimeout(() => {}, 0)
//   }
//
//   focus () {
//     this.refs.editor.focus()
//   }
//
//   componentDidUpdate (prev) {
//     if (prev.initial !== this.props.initial) {
//       const state = EditorState.push(this.state.editorState, this.props.initial, 'insert-characters')
//       this.onChange(state)
//     }
//   }
//
//   decorateState (editorState, force) {
//     return decorate(this.previousAst, this.state.editorState.getCurrentContent().getPlainText(), editorState, force, this.props.segments, this.props.dispatch)
//   }
//
//   onChange (editorState, hide = false, force = false) {
//     const sel = editorState.getSelection()
//     const startKey = sel.getStartKey()
//     const index = sel.getStartOffset()
//     let content = editorState.getCurrentContent()
//     const block = content.getBlockForKey(startKey)
//
//     let entityKey = block.getEntityAt(index)
//     const shouldShow = sel.getHasFocus()
//
//     const saveState = (es = editorState, warning) => {
//       this.state.editorState = es
//       this.state.warning = warning
//       this.state.suggestions.show = false
//       if (this.state.suggestions.disposer) {
//         this.state.suggestions.disposer(this.state.suggestions.data)
//         this.state.suggestions.disposer = null
//       }
//       this.setState(this.state)
//       this.props.onChange(this.state)
//     }
//
//     let warning
//     let ast
//     [editorState, warning, ast] = this.decorateState(editorState, force)
//     this.previousAst = ast
//     saveState(editorState, warning)
//
//     // Allow suggestions when cursor is at an edge
//     if (entityKey === null && index > 0) {
//       entityKey = block.getEntityAt(index - 1)
//     }
//     if (entityKey !== null && Entity.get(entityKey)) {
//       const entity = Entity.get(entityKey)
//       const type = entity.getType()
//       const { value } = entity.getData()
//
//       const suggestionGetter = this.props.suggestionGetters[type]
//
//       if (suggestionGetter) {
//         const { getter, setter, disposer } = suggestionGetter
//
//         clearTimeout(this.timer)
//         this.timer = setTimeout(() => {
//           setter(value, entity.getData())
//         }, 500)
//
//         getter(value, entity.getData(), (suggestions) => {
//           // if (this.state.editorState === editorState) {
//           const show = hide ? false : (suggestions.length > 0) && shouldShow
//           let ranges = []
//           block.findEntityRanges((c) => c.getEntity() === entityKey, (begin, end) => ranges.push({ begin, end }))
//           const { begin, end } = ranges[0]
//
//           this.setState({
//             editorState,
//             suggestions: {
//               show,
//               disposer,
//               list: suggestions,
//               selected: -1,
//               box: findSuggestionBoxPosition(this.refs.editor, this.state.suggestions.box),
//               setter,
//               data: entity.getData(),
//               details: { begin, end }
//             }
//           })
//           // } else {
//             // saveState()
//           // }
//         })
//       } else {
//         saveState(editorState, warning)
//       }
//     } else {
//       saveState(editorState, warning)
//     }
//   }
//
//   onUpArrow (e) {
//     let { list, selected, show } = this.state.suggestions
//
//     if (show) {
//       e.preventDefault()
//       this.state.suggestions.selected = Math.abs(selected - 1) % list.length
//       this.setState(this.state)
//     }
//   }
//
//   onDownArrow (e) {
//     let { list, selected, show } = this.state.suggestions
//
//     if (show) {
//       e.preventDefault()
//       this.state.suggestions.selected = Math.abs(selected + 1) % list.length
//       this.setState(this.state)
//     }
//   }
//
//   onReturn (e) {
//     let { list, selected } = this.state.suggestions
//     if (selected >= 0) {
//       this.onSuggestionSelect(list[selected])
//       return true
//     } else {
//       return false
//     }
//   }
//
//   onSuggestionSelect (suggestion) {
//     const { data, setter } = this.state.suggestions
//     setter(suggestion, data)
//   }
//
//   onTab (e) {
//     e.preventDefault()
//     const { editorState } = this.state
//
//     const sel = editorState.getSelection()
//     const startKey = sel.getStartKey()
//     const sindex = sel.getStartOffset()
//     let content = editorState.getCurrentContent()
//     const lineKey = content.getBlockMap().keySeq()
//     const line = lineKey.findIndex((lk) => lk === startKey)
//
//     const findBlockEntities = (block) => {
//       let ranges = []
//       block.findEntityRanges((c) => c.getEntity() !== null, (begin, end) => ranges.push({ begin, end }))
//       return ranges
//     }
//
//     lineKey.slice(line).find((lk) => {
//       const block = content.getBlockForKey(lk)
//       const index = lk === startKey ? sindex : 0
//       let ranges = findBlockEntities(block)
//       const range = ranges.find((range) => range.begin > index)
//
//       // found a next entity to jump
//       if (range) {
//         const newSel = sel.merge({
//           anchorKey: lk,
//           focusKey: lk,
//           anchorOffset: range.begin,
//           focusOffset: range.begin
//         })
//         const editorState = EditorState.forceSelection(this.state.editorState, newSel)
//         this.onChange(editorState)
//
//         return true
//       } else {
//         // if there are no tag or semantic information, initialize it
//         // if there is but is empty, remove
//       }
//
//       return false
//     })
//   }
//
//   onEsc () {
//     if (this.state.suggestions.show) {
//       this.state.suggestions.show = false
//       this.setState(this.state)
//     }
//   }
//
//   render () {
//     const { className } = this.props
//     const { editorState, suggestions, warning } = this.state
//     const { selected, list, show, box: { left, top } } = suggestions
//
//     return (
//       <div style={{ display: 'flex' }}>
//         <div style={{ color: '#c1c175', width: '23px' }}>
//           {
//             (false || warning)
//               ? (
//                 <i className='fa fa-exclamation-triangle' style={{ padding: '1px', marginTop: (warning.location.start.line - 1) + 'em' }} title={warning.message} />
//                 )
//               : null
//           }
//         </div>
//         <div style={{ flexGrow: 1, display: 'flex' }}>
//           <div style={{ fontFamily: 'monospace', flexGrow: 1, lineHeight: '170%' }} className={className}>
//
//             <Editor
//               editorState={editorState}
//               onChange={this.onChange.bind(this)}
//               stripPastedStyles={true}
//               onDownArrow={this.onDownArrow.bind(this)}
//               onUpArrow={this.onUpArrow.bind(this)}
//               handleReturn={this.onReturn.bind(this)}
//               onEscape={this.onEsc.bind(this)}
//               onTab={this.onTab.bind(this)}
//               ref='editor'
//               spellcheck={false}
//             />
//             <SuggestionBox
//               left={left}
//               top={top}
//               show={show}
//               selected={selected}
//               onSelect={this.onSuggestionSelect.bind(this)}
//               suggestions={list}
//             />
//
//         </div>
//       </div>
//     </div>
//     )
//   }
// }
//
// export default SemanticEditor
