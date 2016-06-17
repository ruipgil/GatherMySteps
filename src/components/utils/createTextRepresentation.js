const createTextRepresentation = (segments) => {
  let buff = []
  segments.forEach((segment) => {
    const start = segment.get('start')
    const end = segment.get('end')
    const from = segment.get('locations').get(0)
    const to = segment.get('locations').get(1)
    const transp = segment.get('transportationModes')

    const DATE_FORMAT = 'HHmm'
    const span = start.format(DATE_FORMAT) + '-' + end.format(DATE_FORMAT)

    let line = span + ': '
    line = line + from.get('label')
    if (to) {
      line = line + ' -> ' + to.get('label')
    }

    if (transp) {
      if (transp.count() === 1) {
        line = line + ' [' + transp.get('label') + ']'
      } else {
        const transports = transp.map((t) => {
          const label = t.get('label')
          const points = segment.get('points')
          const from = points.get(t.get('from'))
          const to = points.get(t.get('to'))
          const tSpan = from.get('time').format(DATE_FORMAT) + '-' + to.get('time').format(DATE_FORMAT)
          return '    ' + tSpan + ': [' + label + ']'
        }).toJS()

        line = line + '\n' + transports.join('\n')
      }
    }

    buff.push(line)
  })
  return buff.join('\n')
}

export default createTextRepresentation
