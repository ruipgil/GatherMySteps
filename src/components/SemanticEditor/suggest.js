import { Entity } from 'draft-js'
import findSuggestionBoxPosition from '../utils/findSuggestionBoxPosition'

export default (editorState, getter, stateSetter, refs, tsuggestions) => {
  const sel = editorState.getSelection()
  const startKey = sel.getStartKey()
  const index = sel.getStartOffset()
  let content = editorState.getCurrentContent()
  const block = content.getBlockForKey(startKey)
  const shouldShow = sel.getHasFocus()

  let entityKey = block.getEntityAt(index)

  if (entityKey === null && index > 0) {
    entityKey = block.getEntityAt(index - 1)
  }
  if (entityKey !== null && Entity.get(entityKey)) {
    const entity = Entity.get(entityKey)
    const type = entity.getType()
    const { value } = entity.getData()

    const suggestionGetter = getter[type]

    if (suggestionGetter) {
      const { getter, setter, disposer } = suggestionGetter

      // clearTimeout(this.timer)
      // this.timer = setTimeout(() => {
      //   setter(value, entity.getData())
      // }, 500)

      getter(value, entity.getData(), (suggestions) => {
        // const show = hide ? false : (suggestions.length > 0) && shouldShow
        const show = (suggestions.length > 0) || shouldShow
        console.log(show, suggestions.length > 0, shouldShow)
        let ranges = []
        block.findEntityRanges((c) => c.getEntity() === entityKey, (begin, end) => ranges.push({ begin, end }))
        const { begin, end } = ranges[0]

        const _suggestions = {
          show,
          disposer,
          list: suggestions,
          selected: -1,
          box: findSuggestionBoxPosition(refs.editor, tsuggestions.box),
          setter,
          data: entity.getData(),
          details: { begin, end, key: startKey }
        }

        stateSetter(_suggestions)
      })
    }
  }
}
