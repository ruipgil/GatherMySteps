import { EditorState } from 'draft-js'

const cursorAt = (editorState, index) => {
  const newSel = editorState.getSelection().merge({
    anchorOffset: index,
    focusOffset: index
  })
  return EditorState.forceSelection(editorState, newSel)
}

export default cursorAt
