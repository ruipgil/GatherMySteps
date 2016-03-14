import React from 'react'
import { Component } from 'react'
import { Badge, Arrow } from 'rebass'
import { CompositeDecorator, Editor, EditorState } from 'draft-js'
import completeWithSuggestion from './completeWithSuggestion'

function findWithRegex (regex, contentBlock, callback, mi = 1, log = null) {
  if (log) {
    console.log(log)
    console.log(regex)
  }
  const text = contentBlock.getText()
  let matchArr, start, matched
  if (log) {
    // console.log(regex.exec(text))
  }
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index
    matched = matchArr[mi]
    if (log) {
      console.log('matched: "%s"', matched)
      console.log('index %d', matchArr.index)
    }

    for (let i = 1; i < mi; i++) {
      start += matchArr[i].length || 0
    }
    const end = start + matched.length
    if (log) {
      console.log('matching %s %s %s', matched, start, end)
      console.log('text: %s', text)
      console.log('substring: "%s"', text.substr(start, end))
      console.log('rest: "%s"', text.substr(0, start))
    }

    callback(start, end)
  }
}

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

const SIMPLE_TAG_REGEX = /\[[^\]]*\]/g
const SimpleTagStrategy = (contentBlock, callback) => {
  findWithRegex(SIMPLE_TAG_REGEX, contentBlock, callback, 0)
}
const SIMPLE_SEMANTICS_REGEX = /\{[^\}]*\}/g
const SimpleSemanticStrategy = (contentBlock, callback) => {
  findWithRegex(SIMPLE_SEMANTICS_REGEX, contentBlock, callback, 0)
}

const Hour = (props) => {
  return (
    <Badge {...props} pill={true} rounded={true} theme='info'>{props.children}<Arrow direction='down' /></Badge>
  )
}

class SemanticEditor extends Component {
  constructor () {
    super()
    const strategies = [
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
    const compositeDecorator = new CompositeDecorator(strategies)

    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
      suggestions: []
    }

    this.focus = () => this.refs.editor.focus()
    this.onChange = (editorState) => {
      const sel = editorState.getSelection()
      const index = sel.get('focusOffset')
      const text = editorState.getCurrentContent().getLastBlock().getText().slice(0, index)
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
      const ARR_S = [
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

      let begin = 0
      let end = 0
      const suggestions = ARR_S.reduce((prev, e) => {
        const { suggester, strategy } = e
        const found = strategy(text)
        if (found) {
          const result = suggester(found)
          begin = result.begin
          end = result.end
          result.suggestions.forEach((r) => prev.push(r))
          return prev
        }
        return prev
      }, [])

      this.setState({
        editorState,
        suggestions,
        sugSelected: -1,
        details: {
          begin,
          end
        }
      })
    }
  }

  render () {
    const upArrow = (e) => {
      let state = this.state
      state.sugSelected = (state.sugSelected - 1) % state.suggestions.length
      this.setState(state)
    }
    const downArrow = (e) => {
      let state = this.state
      state.sugSelected = (state.sugSelected + 1) % state.suggestions.length
      this.setState(state)
    }
    const onReturn = (e) => {
      let state = this.state
      if (state.sugSelected >= 0) {
        let option = state.suggestions[state.sugSelected]
        onSuggestionSelect(option)
        return true
      } else {
        return false
      }
    }

    const onSuggestionSelect = (suggestion) => {
      console.log(this.state)
      let { begin, end } = this.state.details
      const newEditorState = completeWithSuggestion(this.state.editorState, suggestion, begin, end)
      this.onChange(newEditorState)
    }

    return (
      <div style={{ fontFamily: 'monospace' }}>
        <div>
        <div>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          placeholder='Start typing'
          stripPastedStyles={true}
          onDownArrow={downArrow}
          onUpArrow={upArrow}
          handleReturn={onReturn}
          ref='editor'
          spellcheck={false}
        />
        </div>
        </div>
        <ul>
          {
            this.state.suggestions.map((s, i) => {
              return <li key={i} onClick={onSuggestionSelect.bind(this, s)} style={{
                backgroundColor: (i === this.state.sugSelected) ? 'yellow' : 'transparent'
              }}>{s}</li>
            })
          }
        </ul>
      </div>
    )
  }
}

// const regEx = /(\d{4})-(\d{4}):\s*([^->\[\{]*)\s*(?:->([^\[\{]*))?\s*(?:\[([^\]]*)\])?\s*(?:\{([^}]*)\})?/g

export default SemanticEditor
