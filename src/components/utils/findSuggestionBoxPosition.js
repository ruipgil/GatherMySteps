import { findDOMNode } from 'react-dom'

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
  let sbLeft = 0
  let sbTop = 0
  if (_sel.rangeCount) {
    const parent = getValidParent(_sel.baseNode)
    const rect = parent.getBoundingClientRect()
    const edp = findDOMNode(editorRef).getBoundingClientRect()
    sbLeft = rect.left - edp.left
    sbTop = rect.bottom - edp.top + 4
  }
  if (sbTop === 0) {
    return last
  } else {
    return { left: sbLeft, top: sbTop }
  }
}
