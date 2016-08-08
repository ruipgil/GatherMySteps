import { EditorState } from 'draft-js'

export const selectNextEntity = (editorState, backwards = false) => {
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

  let searchSpace
  if (backwards) {
    searchSpace = lineKey.slice(0, line + 1).reverse()
  } else {
    searchSpace = lineKey.slice(line)
  }
  searchSpace.find((lk) => {
    const block = content.getBlockForKey(lk)
    const index = lk === startKey ? sindex : (backwards ? block.getText().length + 1 : -1)
    let ranges = findBlockEntities(block)
    if (backwards) {
      ranges.reverse()
    }
    const backwardSearch = (range) => range.end < index
    const forwardSearch = (range) => range.begin > index
    const range = ranges.find(backwards ? backwardSearch : forwardSearch)

    // found a next entity to jump
    if (range) {
      const newSel = sel.merge({
        anchorKey: lk,
        focusKey: lk,
        anchorOffset: range.begin,
        focusOffset: range.end
      })
      editorState = EditorState.forceSelection(editorState, newSel)
      return true
    } else {
      // if there are no tag or semantic information, initialize it
      // if there is but is empty, remove
    }

    return false
  })

  return editorState
}
