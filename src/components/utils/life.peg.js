import PEG from 'pegjs'

const simpleParserString = String.raw`
{
// equivalent of { ...obj, ...that }
const extend = (obj, that) => {
  return Object.assign({}, obj, that)
}
const d = (type, obj, marksExt) => {
  const {start, end} = location()
  const offset = start.column-1
  const length = end.column - start.column
  const line = start.line - 1
  return extend({type, marks: extend({offset, length, line}, marksExt)}, obj)
}
const push = (elm, arr) => {
  arr.push(elm)
  return arr
}
const append = (elm, arr) => {
  arr.unshift(elm)
  return arr
}
}

DayBlock
  = _ day:DayDate _ nl+ blocks:StaysTrips { return { day, blocks } }

StaysTrips
  = head:StayTrip nl+ rest:StaysTrips { return append(head, rest) }
  / st:StayTrip { return [st] }

StayTrip
  = Timezone
  / Trip
  / Stay
  / Empty

/*
  = StayTripBlock StaysTrips
  / Stay StaysTrips
  / Empty
*/

Empty
  = Comment
  / nl*

StayTripBlock
  = Stay


nl "new line"
  = '\n'

DayDate
  = "--" year:([0-9]+) "_" month:([0-9]+) "_" day:([0-9]+) { return d('Day', { value: { year: Number(year.join('')), month: Number(month.join('')), day: Number(day.join('')) } }) }

Stay
  = timespan:Timespan _ location:Location details:Details* comment:_ {
  return { type: 'Stay', timespan, location, comment, details }
  }
/*
First
  = day:DayDate nl? value:Start { return { day, value } }
  / value:Start { return { day: undefined, value } }

Start
  = h:OneOf nl? r:Start { return [h, ...r] }
  / nl r:Start { return r }
  / h:OneOf { return [h] }
  / nl { return [] }

*/
TimezoneOffset
  = "+" offset:[0-9]+ { return Number(offset.join('')) }
  / "-" offset:[0-9]+ { return Number(offset.join('')) }

Timezone "timezone"
  = "@"? "UTC" offset:TimezoneOffset? ws:ws comment:Comment? { return d('Timezone', { value: offset || 0, comment }) }

/*
OneOf
  = Trip
  / Stay
  / Comment
*/
Timespan
  = start:Time "-" finish:Time ":" {
  return d('Timespan', { start, finish } , { length: start.marks.length + finish.marks.length + 1 })
  }

Time "time"
  = [0-9]+ { return d('Time', { value: text() }) }

Trip
  = timespan:Timespan _ locationFrom:LocationFrom _ locationTo:Location details:Details* comment:_ tmodes:TModes {
  return { type: 'Trip', timespan, locationFrom, locationTo, details, comment, tmodes }
  }

Location "location"
  = [^\n\[\{;]* {
  const value = text().trim()
  return d('Location', { value }, { length: value.length })
  }

LocationFrom
  = h:[^\n\[\{;] _ '->' {
  return d('LocationFrom', { value: h }, { length: 1 })
  //return { value: '', marks: { length: 0 } }
  }
  / h:[^\n\[\{;] r:LocationFrom {
  return d('LocationFrom', { value: h + r.value }, { length: 1 + r.marks.length })
  }



TMode
  = __ timespan:Timespan details:Details* ws comment:Comment? {
  return d('TMode', { timespan, details, comment })
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

ws
  = [ \t]*

_
  = Comment
  / [ \t]*

__
  = [ \t]+

Comment "comment"
  = ';' r:[^\n]* { return d('Comment', {value: r.join('')}) }
`

export default PEG.buildParser(simpleParserString, { cache: true })
