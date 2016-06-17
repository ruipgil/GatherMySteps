const createRawRepresentation = (segments, dispatch) => {
  let entityMap = {}
  let blocks = []

  let c = 0
  const addToBlock = (block, text, type, data) => {
    const offset = block.text.length
    block.text += text
    if (type) {
      const key = type + '_' + (c++)
      entityMap[key] = {
        type,
        data: {
          text,
          ...data
        },
        mutability: 'MUTABLE'
      }
      block.entityRanges.push({ offset, length: text.length, key })
    }
  }

  const createBlock = () => ({
    text: '',
    type: 'unstyled',
    entityRanges: []
  })

  segments.forEach((segment, i) => {
    let block = createBlock()

    const start = segment.get('start')
    const end = segment.get('end')
    const from = segment.get('locations').get(0)
    const to = segment.get('locations').get(1)
    const transp = segment.get('transportationModes')

    const DATE_FORMAT = 'HHmm'
    const span = start.format(DATE_FORMAT) + '-' + end.format(DATE_FORMAT)

    addToBlock(block, span, 'TSPAN', { segment, dispatch })
    addToBlock(block, ': ')

    addToBlock(block, from.get('label'), 'PLACE_FROM', { segment, dispatch })

    if (to) {
      addToBlock(block, ' -> ')
      addToBlock(block, to.get('label'), 'PLACE_TO', { segment, dispatch })
    }

    if (transp) {
      if (transp.count() === 1) {
        addToBlock(block, ' [')
        addToBlock(block, transp.get('label'), 'TAG', { segment, dispatch })
        addToBlock(block, ']')

        blocks.push(block)
      } else {
        blocks.push(block)

        transp.forEach((t) => {
          const label = t.get('label')
          const points = segment.get('points')
          const from = points.get(t.get('from'))
          const to = points.get(t.get('to'))
          const tSpan = from.get('time').format(DATE_FORMAT) + '-' + to.get('time').format(DATE_FORMAT)
          block = createBlock()
          addToBlock(block, '    ')
          addToBlock(block, tSpan, 'TSPAN', { segment, dispatch })
          addToBlock(block, ': ')
          addToBlock(block, '[' + label + ']', 'TAG', { segment, dispatch, text: label })
          blocks.push(block)
        })
      }
    } else {
      blocks.push(block)
    }
  })
  return {
    blocks,
    entityMap
  }
}

export default createRawRepresentation
