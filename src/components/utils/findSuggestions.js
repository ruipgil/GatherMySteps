import { reduce } from 'async'

export default function findSuggestions (text, strategies, callback) {
  let begin = 0
  let end = 0
  let strateg = null
  reduce(strategies, [], (prev, e, done) => {
    const { suggester, strategy } = e
    const found = strategy(text)
    if (found) {
      strateg = e
      suggester(found, (result) => {
        begin = result.begin
        end = result.end
        result.suggestions.forEach((r) => prev.push(r))
        done(null, prev)
      })
    } else {
      done(null, prev)
    }
  }, (err, suggestions) => {
    if (err) {
      callback({
        suggestions: [],
        begin: 0,
        end: 0,
        strategy: null
      })
    } else {
      callback({
        suggestions,
        begin,
        end,
        strategy: strateg
      })
    }
  })
}
