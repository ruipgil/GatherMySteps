import { EditorState, SelectionState, Modifier, Entity } from 'draft-js'
import buildLifeAst from './buildLifeAst'

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
  return decriptiveStyle(elm.type, elm.marks, elm.value, content, lineKeys, more)
}

const StyleMappings = {
  'Day': generalMapping,
  'Tag': generalMapping,
  'Time': generalMapping,
  'LocationFrom': generalMapping,
  'Location': generalMapping,
  'Trip': (trip, content, lineKeys, more) => {
    const refs = { ...more, references: trip.references }
    content = StyleMappings['Timespan'](trip.timespan, content, lineKeys, refs)
    content = StyleMappings['LocationFrom'](trip.locationFrom, content, lineKeys, refs)
    content = StyleMappings['Location'](trip.locationTo, content, lineKeys, refs)
    trip.tmodes.forEach((tmode) => {
      content = StyleMappings[tmode.type](tmode, content, lineKeys, refs)
    })
    trip.details.forEach((detail) => {
      content = StyleMappings[detail.type](detail, content, lineKeys, refs)
    })
    return content
  },
  'TMode': (tmode, content, lineKeys, more) => {
    content = StyleMappings['Timespan'](tmode.timespan, content, lineKeys, more)
    tmode.details.forEach((detail) => {
      content = StyleMappings[detail.type](detail, content, lineKeys, more)
    })
    return content
  },
  'Timespan': (time, content, lineKeys, more) => {
    content = StyleMappings[time.start.type](time.start, content, lineKeys, more)
    content = StyleMappings[time.finish.type](time.finish, content, lineKeys, more)
    return content
  },
  'Stay': (stay, content, lineKeys, more) => {
    const refs = { ...more, references: stay.references }
    content = StyleMappings['Timespan'](stay.timespan, content, lineKeys, refs)
    content = StyleMappings['Location'](stay.location, content, lineKeys, refs)
    stay.details.forEach((detail) => {
      content = StyleMappings[detail.type](detail, content, lineKeys, refs)
    })
    return content
  }
}

const decorate = (currentText, editorState, force, segments, dispatch) => {
  const sel = editorState.getSelection()
  const startKey = sel.getStartKey()
  let content = editorState.getCurrentContent()
  const lineKey = content.getBlockMap().keySeq()
  const block = content.getBlockForKey(startKey)
  const blockText = block.getText()

  const next = content.getPlainText()
  let warning

  if (force || currentText !== next) {
    // const segs = segments.toList()

    // try {
      const parts = buildLifeAst(content.getPlainText())
      console.log(parts)

      content = StyleMappings['Day'](parts.day, content, lineKey)
      parts.blocks.forEach((block) => {
        try {
          content = StyleMappings[block.type](block, content, lineKey, { dispatch })
        } catch (e) {
          console.log(e)
        }
      })

      const ts = sel.merge({
        focusOffset: blockText.length,
        anchorOffset: 0
      })
      content = Modifier.applyEntity(content, ts, null)

      editorState = EditorState.push(editorState, content, 'apply-entity')
      editorState = EditorState.forceSelection(editorState, sel)
    // } catch (e) {
    //   warning = e
    //   console.error(e)
    // }
  }
  console.log(editorState, warning)

  return [editorState, warning]
}

export default decorate
