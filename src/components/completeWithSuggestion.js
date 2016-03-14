import { Modifier, EditorState } from 'draft-js'

const completeWithSuggestion = (editorState, suggestion, begin, end) => {
  const textSelection = editorState.getSelection().merge({
    anchorOffset: begin,
    focusOffset: end
  })

  let mentionReplacedContent = Modifier.replaceText(
    editorState.getCurrentContent(),
    textSelection,
    suggestion,
    null,
    null
  )

  const newEditorState = EditorState.push(
    editorState,
    mentionReplacedContent,
    'insert-suggestion'
  )
  return EditorState.forceSelection(newEditorState, mentionReplacedContent.getSelectionAfter())
}

export default completeWithSuggestion
