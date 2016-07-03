import PEG from 'pegjs'

const simpleParserString = String.raw`
{
const d = (type, obj) => {
  const {start, end} = location()
  const offset = start.column-1
  const length = end.column - start.column
  const line = start.line - 1
  return Object.assign({}, {type, offset, length, line}, obj)
}
}

First
  = day:DayDate nl? value:Start { return { day, value } }
  / value:Start { return { day: undefined, value } }

Start
  = h:OneOf nl? r:Start { return [h, ...r] }
  / nl r:Start { return r }
  / h:OneOf { return [h] }
  / nl { return [] }

nl
  = '\n'

DayDate
  = "--" year:([0-9]+) "_" month:([0-9]+) "_" day:([0-9]+)

Timezone
  = "UTC+" offset:([0-9]{1,2}) { return d('Timezone', { value: parseInt(offset.join('')) }) }
  / "UTC" { return d('Timezone', { value: 0 }) }

OneOf
  = Trip
  / Span
  / Comment

Timespan
  = start:Time "-" finish:Time ":" {
  return d('Timespan', { start, finish, length: start.length + finish.length + 1 })
  }

Time
  = [0-9]+ { return d('Time', { value: text() }) }

Trip
  = timespan:Timespan _ locationFrom:LocationFrom _ locationTo:Location details:Details* comment:_ tmodes:TModes {
  return d('Trip', { timespan, locationFrom, locationTo, details, comment, tmodes })
  }

Location
  = [^\n\[\{;]* {
  const value = text().trim()
  return d('Location', { value, length: value.length })
  }

LocationFrom
  = _ '->' { return { value: '', length: 0 } }
  / h:[^\n\[\{;] r:LocationFrom {
  return d('LocationFrom', { value: h + r.value, length: 1 + r.length })
  }

Span
  = timespan:Timespan _ location:Location details:Details* comment:_ {
  return d('Span', { timespan, location, comment, details })
  }

TMode
  = __ timespan:Timespan details:Details*  _ {
  return d('TMode', { timespan, details })
  }

TModes
  = m:(nl TMode)* { return m.map((e) => e[1]) }

Tag
  = '[' label:[^\]\n]* closed:']'? {
  return d('Tag', { value: label.join(''), closed: !!closed })
  }

Semantic
  = '{' label:[^\}\n]* '}'? {
  return d('Tag', { value: label.join(''), closed: !!closed })
  }

Details
  = _ r:Tag { return r }
  / _ r:Semantic { return r }

_
  = Comment
  / [ \t]*

__
  = [ \t]+

Comment
  = ';' r:[^\n]* { return r.join('') }
`

export default PEG.buildParser(simpleParserString, { cache: true })
