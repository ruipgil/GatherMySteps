import cursorAt from './cursorAt'
import addTextAt from './addTextAt'
import removeTextAt from './removeTextAt'

const generateTabFromSeparator = (endSeparator, RE, next, captureGroup = 1) => {
  return (editorState) => {
    const sel = editorState.getSelection()
    const index = sel.get('focusOffset')

    const text = editorState.getCurrentContent().getLastBlock().getText()
    const right = text.slice(index)
    const left = text.slice(0, index)

    let closeMatch = right.match(endSeparator)
    if (closeMatch && endSeparator !== '') {
      // Position cursor at the end
      const toIndex = closeMatch.index + index + endSeparator.length
      return cursorAt(editorState, toIndex)
    } else {
      const e = RE ? RE.exec(text) : false
      if (e && e[captureGroup] !== undefined && e[captureGroup].trim() === '') {
        // Remove 'start separator', it's an empty tag
        editorState = removeTextAt(editorState, e.index, e.index + endSeparator.length)
        if (next) {
          return addTextAt(editorState, next, e.index)
        } else {
          return editorState
        }
      } else {
        let c = false
        if (e) {
          const i = e[0].slice(-endSeparator.length).trim()
          c = i === endSeparator
        }
        if (c) {
          if (next) {
            // Start next section
            return addTextAt(editorState, next, index)
          }
        } else if (right.length > 0) {
          // Skip this section
          console.log(index, right.length)
          return cursorAt(editorState, index + right.lenght)
        } else if (left.trim().slice(-endSeparator.length) !== endSeparator) {
          // End current section
          return addTextAt(editorState, endSeparator, index)
        }
      }
    }
  }
}

export default generateTabFromSeparator
