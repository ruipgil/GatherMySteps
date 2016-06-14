import PEG from 'pegjs'

const parserString = String.raw`
{

const createLoc = (t, loc) => {
t = t || text()
loc = location()
return { offset: loc.start.offset, length: t.length, line: loc.start.line - 1 }
}

}
Start
  = h:Span t:Start { return [...h, ...t] }
  / '\n' t:Start { return t }
  / r:Span '\n'? { return r }

Span
  = tspan:TSpan _ place:Place tmodes:TModes? { return [ tspan, ...place, ...tmodes ] }

TSpan "timespan"
  = from:Digits "-" to:Digits ":" { return { type: "Timespan", from, to, location: createLoc() } }

Digits "time"
  = Hours Minutes { return { label: text(), location: createLoc() } }

Hours "hours"
  = [0-1][0-9] { return text() }
  / "2"[0-4] { return text() }

Minutes "minutes"
  = [0-5][0-9]

Place "place"
  = from:LocationFrom to:Location details:(Details*) { return [from, to, ...details] }
  / from:Location { return [from] }

Location
  = h:[^\[\{\n]+ _ { return { type: 'Place', label: h.join(''), location: createLoc() } }

LocationFrom
  = h:[^\n] _ Sep _ { return { type: 'Place_from', label: h, location: createLoc(h) } }
  / h:[^\n] t:LocationFrom { return { type: 'Place_from', label: h + t.label, location: createLoc(h + t.label) } }

Sep
  = "->"

Details
  = tag:Tag { return { type: 'Tag', value: tag } }
  / sem:Semantic { return { type: 'Semantic', value: sem } }

Tag "tag"
  = "[" content:[^\]\n]* "]" { return { label: content.join(''), location: createLoc() } }

Semantic "semantic information"
  = "{" content:[^\}\n]* "}"  { return { label: content.join(''), location: createLoc() } }

TModes
  = r:('\n' r:TMode)* { return r.map((r) => r[1]) }

TMode "transportation mode"
  = __ time:TSpan _ mode:Tag sem:Semantic? { return [time, mode, sem] }

__ "whitespace"
 = [ \t]+

_ "whitespace"
  = [ \t]*
`

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

Start
  = h:OneOf nl? r:Start { return [h, ...r] }
  / nl r:Start { return r }
  / h:OneOf { return [h] }
  / nl { return [] }

nl
  = '\n'


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
