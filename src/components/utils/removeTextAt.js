import { Modifier, EditorState } from 'draft-js'

const removeTextAt = (editorState, from, to) => {
  const range = editorState.getSelection().merge({
    anchorOffset: from,
    focusOffset: to
  })

  let newContent = Modifier.removeRange(
    editorState.getCurrentContent(),
    range,
    null
  )

  const newEditorState = EditorState.push(
    editorState,
    newContent,
    'remove-span-arrow'
  )
  return EditorState.forceSelection(newEditorState, newContent.getSelectionAfter())
}

export default removeTextAt
