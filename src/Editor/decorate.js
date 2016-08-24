import buildLifeAst from './buildLifeAst'
import { EditorState, SelectionState, Modifier, Entity } from 'draft-js'

const decriptiveStyle = (styleType, marks, value, content, lineKeys, more = {}) => {
  const { offset, length, line } = marks

  const start = offset
  const end = offset + length

  const _sel = new SelectionState({
    anchorOffset: start,
    anchorKey: lineKeys.get(line),
    focusKey: lineKeys.get(line),
    focusOffset: end,
    isBackward: false,
    hasFocus: false
  })
  const ekey = Entity.create(styleType, 'MUTABLE', {
    ...more,
    value: value
  })
  return Modifier.applyEntity(content, _sel, ekey)
}

const generalMapping = (elm, content, lineKeys, more = {}) => {
  return decriptiveStyle(elm.type, elm.marks, elm.value, content, lineKeys, { astBranch: elm, ...more })
}

const StyleMappings = {
  'Day': generalMapping,
  'Tag': generalMapping,
  'Time': generalMapping,
  'LocationFrom': generalMapping,
  'Location': generalMapping,
  'Comment': generalMapping,
  'Timezone': (timezone, content, lineKeys, more) => {
    content = generalMapping(timezone, content, lineKeys, more)
    if (timezone.comment) {
      content = StyleMappings['Comment'](timezone.comment, content, lineKeys, more)
    }
    return content
  },
  'Trip': (trip, content, lineKeys, more) => {
    const refs = { ...more, references: trip.references }
    content = StyleMappings['Timespan'](trip.timespan, content, lineKeys, refs)
    content = StyleMappings['LocationFrom'](trip.locationFrom, content, lineKeys, { ...more, references: trip.references.from })
    content = StyleMappings['Location'](trip.locationTo, content, lineKeys, { ...more, references: trip.references.to })
    trip.tmodes.forEach((tmode) => {
      content = StyleMappings[tmode.type](tmode, content, lineKeys, refs)
    })
    trip.details.forEach((detail) => {
      content = StyleMappings[detail.type](detail, content, lineKeys, refs)
    })
    return content
  },
  'TMode': (tmode, content, lineKeys, more) => {
    more = { ...more, references: tmode.references }
    content = StyleMappings['Timespan'](tmode.timespan, content, lineKeys, more)
    tmode.details.forEach((detail) => {
      content = StyleMappings[detail.type](detail, content, lineKeys, more)
    })
    if (tmode.comment) {
      content = StyleMappings['Comment'](tmode.comment, content, lineKeys, more)
    }
    return content
  },
  'Timespan': (time, content, lineKeys, more) => {
    content = StyleMappings[time.start.type](time.start, content, lineKeys, { ...more, timezone: time.timezone, references: more.references.from })
    content = StyleMappings[time.finish.type](time.finish, content, lineKeys, { ...more, timezone: time.timezone, references: more.references.to })
    return content
  },
  'Stay': (stay, content, lineKeys, more) => {
    const refs = { ...more, references: stay.references }
    content = StyleMappings['Timespan'](stay.timespan, content, lineKeys, refs)
    content = StyleMappings['Location'](stay.location, content, lineKeys, refs)
    if (stay.comment.type) {
      content = StyleMappings[stay.comment.type](stay.comment, content, lineKeys, refs)
    }
    stay.details.forEach((detail) => {
      content = StyleMappings[detail.type](detail, content, lineKeys, refs)
    })
    return content
  }
}

const decorateAstRoot = (content, root, lineKeys, more) => {
  content = StyleMappings['Day'](root.day, content, lineKeys)
  root.blocks.forEach((block) => {
    const mapping = StyleMappings[block.type]
    if (mapping) {
      content = mapping(block, content, lineKeys, more)
    }
  })
  return content
}

const decorateWithAst = (previousAst, text, content, lineKeys, segments, more) => {
  let ast
  try {
    ast = buildLifeAst(text, segments)
  } catch (e) {
    return [content, null, e]
  }

  content = decorateAstRoot(content, ast, lineKeys, more)
  return [content, ast, null]
}

const decorate = (previousAst, editorState, segments, dispatch) => {
  let content = editorState.getCurrentContent()
  const sel = editorState.getSelection()
  // immutablejs sequence, that associates line number (index) with draft-js key
  const lineKeys = content.getBlockMap().keySeq()

  const startKey = sel.getStartKey()
  const block = content.getBlockForKey(startKey)
  const blockText = block.getText()

  let warning, ast

  const text = content.getPlainText()

  const ts = sel.merge({
    focusOffset: blockText.length,
    anchorOffset: 0
  })
  content = Modifier.applyEntity(content, ts, null)

  const res = decorateWithAst(previousAst, text, content, lineKeys, segments, { dispatch })
  content = res[0]
  ast = res[1]
  warning = res[2]

  editorState = EditorState.push(editorState, content, 'apply-entity')
  editorState = EditorState.acceptSelection(editorState, sel)
  return [editorState, ast, warning]
}

export default decorate
