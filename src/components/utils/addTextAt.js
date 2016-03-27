import { Modifier, EditorState } from 'draft-js'

const addTextAt = (editorState, text, index) => {
  const sel = editorState.getSelection().merge({
    anchorOffset: index,
    focusOffset: index
  })
  const closeTagReplacedContent = Modifier.replaceText(
    editorState.getCurrentContent(),
    sel,
    text,
    null,
    null
  )

  const newEditorState = EditorState.push(
    editorState,
    closeTagReplacedContent,
    'complete-place-from'
  )
  return EditorState.forceSelection(newEditorState, closeTagReplacedContent.getSelectionAfter())
}

export default addTextAt
