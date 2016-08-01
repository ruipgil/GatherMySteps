import LIFEParser from 'components/utils/life.peg.js'

const insertReference = (target, obj) => {
  if (target.references) {
    target.references.push(obj)
  } else {
    target.references = [obj]
  }
}

export default (text) => {
  try {
    const fragments = LIFEParser.parse(text)

    let tripCounter = 0
    let stack = []

    for (let block of fragments.blocks) {
      const previous = stack[stack.length - 1]
      switch (block.type) {
        case 'Trip':
          if (previous && previous.type === 'Stay') {
            if (previous.location.value === block.locationFrom.value) {
              insertReference(previous, ['start', tripCounter])
            }
          }
          block.references = tripCounter
          tripCounter++
          stack.push(block)
          break
        case 'Stay':
          if (previous && previous.type === 'Trip') {
            if (previous.locationTo.value === block.location.value) {
              insertReference(block, ['end', previous.references])
            }
          }
          stack.push(block)
          break
      }
      // if (block.type === 'Trip' || block.type === 'Stay') {
      //   const pattern3 = makePattern(stack, -3)
      //   const len = stack.length
      //   if (pattern3 === 'StayTripStay') {
      //     insert(stack[len - 3], ['start', tripCounter])
      //     stack[len - 2].references = tripCounter
      //     insert(stack[len - 1], ['start', tripCounter])
      //   }
      //
      //   if (block.type === 'Trip') {
      //     tripCounter++
      //   }
      //   stack.push(block)
      // }
    }
    return fragments
  } catch (e) {
    throw e
  }
}
