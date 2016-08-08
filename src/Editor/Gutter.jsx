import React from 'react'

const getDOMBlock = (blockKey) => document.querySelector('[data-offset-key="' + blockKey + '-0-0"][data-block=true]')

const getBlockHeight = (blockKey) => {
  const block = getDOMBlock(blockKey)
  if (block) {
    return { height: block.offsetHeight + 'px' }
  } else {
    return {}
  }
}

const guttersFromChildren = (children) => {
  children = children || []
  children = Array.isArray(children) ? children : [children]
  return children.reduce((prev, gutter) => {
    const { line } = gutter.props
    if (prev[line]) {
      prev[line].push(gutter)
    } else {
      prev[line] = [ gutter ]
    }
    return prev
  }, {})
}

const Gutter = ({ editorState, defaultGutter, style, children }) => {
  const gutters = guttersFromChildren(children)
  const blockKeys = editorState.getCurrentContent().getBlockMap().keySeq()

  return (
    <ol style={style}>
      {
        blockKeys.map((blockKey, i) => {
          const gutter = gutters[i] || defaultGutter(i)
          return (
            <li style={{ ...getBlockHeight(blockKey) }}>
              { gutter }
            </li>
          )
        })
      }
    </ol>
  )
}

export default Gutter
