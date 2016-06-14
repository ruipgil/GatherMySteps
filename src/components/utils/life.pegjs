Start
  = h:Span t:Start { return [h, t] }
  / '\n' t:Start { return t }
  / r:Span '\n'? { return r }

Span
  = tspan:TSpan _ place:Place tmodes:TModes? { return { time: tspan, place, tmodes } }

TSpan "timespan"
  = from:Digits "-" to:Digits ":" { return { from, to } }

Digits "time"
  = Hours Minutes { return text() }

Hours "hours"
  = [0-1][0-9] { return text() }
  / "2"[0-4] { return text() }

Minutes "minutes"
  = [0-5][0-9]

Place "place"
  = from:LocationFrom to:Location details:(Details*) { return {from, to, details} }
  / from:Location { return {from} }

Location
  = h:[^\[\{\n]+ _ { return h.join('') }

LocationFrom
  = _ Sep _ { return '' }
  / h:[^\n] t:LocationFrom { return h + t }

Sep
  = "->"

Details
  = tag:Tag { return { type: 'Tag', value: tag } }
  / sem:Semantic { return { type: 'Semantic', value: sem } }

Tag "tag"
  = "[" content:[^\]\n]* "]" { return content.join('') }

Semantic "semantic information"
  = "{" content:[^\}\n]* "}"  { return content.join('') }

TModes
  = r:('\n' r:TMode)* { return r.map((r) => r[1]) }

TMode "transportation mode"
  = __ time:TSpan _ mode:Tag sem:Semantic? { return { time, mode, sem } }

__ "whitespace"
 = [ \t]+

_ "whitespace"
  = [ \t]*
