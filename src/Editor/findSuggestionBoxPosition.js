const getValidParent = (elm) => {
  if (elm.getBoundingClientRect) {
    return elm
  } else if (elm.parentElement) {
    return getValidParent(elm.parentElement)
  } else {
    return null
  }
}

export default function findSuggestionBoxPosition (editorRef, last) {
  const _sel = window.getSelection()
  if (_sel.rangeCount) {
    const parent = getValidParent(_sel.baseNode)
    const rect = parent.getBoundingClientRect()
    return {
      left: rect.left,
      top: rect.top + rect.height
    }
  } else {
    return last
  }
}
