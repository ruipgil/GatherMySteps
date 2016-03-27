import cursorAt from './cursorAt'
import addTextAt from './addTextAt'
import removeTextAt from './removeTextAt'

const generateTabFromSeparator = (endSeparator, RE, next) => {
  return (editorState) => {
    const sel = editorState.getSelection()
    const index = sel.get('focusOffset')

    const text = editorState.getCurrentContent().getLastBlock().getText()
    const right = text.slice(index)

    let closeMatch = right.match(endSeparator)
    if (closeMatch) {
      // Position cursor at the end
      const toIndex = closeMatch.index + index + endSeparator.length
      return cursorAt(editorState, toIndex)
    } else {
      const e = RE ? RE.exec(text) : false
      if (e && e[1] && e[1].trim() === '') {
        // Remove 'start separator', it's an empty tag
        return removeTextAt(editorState, e.index, e.index + endSeparator.length)
      } else {
        if (next && e && e[0].trim().split(endSeparator.length) === endSeparator) {
          // Start next section
          return addTextAt(editorState, next, index)
        } else {
          // End current section
          return addTextAt(editorState, endSeparator, index)
        }
      }
    }
  }
}

export default generateTabFromSeparator
