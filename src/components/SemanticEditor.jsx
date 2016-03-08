import React from 'react'
import { Component } from 'react'
import { CompositeDecorator, Editor, EditorState } from 'draft-js'

function findWithRegex (regex, contentBlock, callback, mi = 1, log = null) {
  if (log) {
    console.log(log)
    console.log(regex)
  }
  const text = contentBlock.getText()
  let matchArr, start, matched
  if (log) {
    //console.log(regex.exec(text))
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

const HOUR_START_REGEX = /^(\d{4})-/g
const HourStartStrategy = (contentBlock, callback) => {
  findWithRegex(HOUR_START_REGEX, contentBlock, callback)
}

const HOUR_END_REGEX = /^(\d{4}-)(\d{4})/g
const HourEndStrategy = (contentBlock, callback) => {
  findWithRegex(HOUR_END_REGEX, contentBlock, callback, 2)
}

const PLACE_START_REGEX = /^(\d{4}-\d{4}:\s*)([^\[\{\>\-]+)/g
const PlaceStartStrategy = (contentBlock, callback) => {
  findWithRegex(PLACE_START_REGEX, contentBlock, callback, 2, 'place-start')
}

const PLACE_END_REGEX = /^(\d{4}-\d{4}:\s*[^\[\{\>\-]+\s*->\s*)([^\[\{\>\-]+\s*)/g
const PlaceEndStrategy = (contentBlock, callback) => {
  findWithRegex(PLACE_END_REGEX, contentBlock, callback, 2, 'place-end')
}

const TAG_REGEX = /^(\d{4}-\d{4}:\s*[^\[\{\>\-]+(?:->[^\[\{\>\-]+)?)(\[[^\]]*\])/g
const TagStrategy = (contentBlock, callback) => {
  findWithRegex(TAG_REGEX, contentBlock, (a, b) => {
    console.log('tag', a, b, callback)
    callback(a, b)
  }, 2, 'tag')
}

const SIMPLE_TAG_REGEX = /\[[^\]]*\]/g
const SimpleTagStrategy = (contentBlock, callback) => {
  findWithRegex(SIMPLE_TAG_REGEX, contentBlock, callback, 0, 'simple tag')
}
const SIMPLE_SEMANTICS_REGEX = /\{[^\}]*\}/g
const SimpleSemanticStrategy = (contentBlock, callback) => {
  findWithRegex(SIMPLE_SEMANTICS_REGEX, contentBlock, callback, 0, 'ss')
}

const SEMANTICS_REGEX = /^(\d{4}-\d{4}:\s*[^\[\{\>\-]+(?:->[^\[\{\>\-]+)?(?:\[[^\]]*\])?\s*)(\{[^\}]+\})/g
const SemanticStrategy = (contentBlock, callback) => {
  findWithRegex(SEMANTICS_REGEX, contentBlock, (a, b) => {
    console.log('tag', a, b, callback)
    callback(a, b)
  }, 2, 'semantics')
}

const Hour = (props) => {
  return (
    <span {...props} className='hour' style={{border: 'solid black 2px'}}>
      {props.children}
    </span>
  )
}

const Logger = (block, callback) => {
  console.log('Logger: "%s"', block.getText())
}

class SemanticEditor extends Component {
  constructor () {
    super()
    const compositeDecorator = new CompositeDecorator([
      {
        strategy: Logger
      },
      {
        strategy: HourStartStrategy,
        component: Hour
      },
      {
        strategy: HourEndStrategy,
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
      /*
      {
        strategy: TagStrategy,
        element: Tag
      },
      {
        strategy: DetailsStrategy,
        element: Details
      }*/
    ])

    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator)
    }

    this.focus = () => this.refs.editor.focus()
    this.onChange = (editorState) => {
      this.setState({editorState})
      this.logState()
    }
    this.logState = () => console.log(this.state.editorState.toJS())
  }

  render () {
    return (
      <div style={{ fontFamily: 'monospace' }}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          ref='editor'
          spellcheck={false}
        />
      </div>
    )
  }
}

// const regEx = /(\d{4})-(\d{4}):\s*([^->\[\{]*)\s*(?:->([^\[\{]*))?\s*(?:\[([^\]]*)\])?\s*(?:\{([^}]*)\})?/g

export default SemanticEditor
