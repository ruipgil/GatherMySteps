import { reduce } from 'async'

export default function findSuggestions (text, cursor, strategies, callback, stateInfo) {
  let begin = 0
  let end = 0
  let strateg = null
  reduce(strategies, [], (prev, e, done) => {
    const { suggester, suggestionStrategy, id } = e
    const strategy = suggestionStrategy
    if (!strategy) {
      return done(null, prev)
    }
    const found = strategy(text, cursor)
    if (found) {
      strateg = e
      suggester(found, (result) => {
        begin = result.begin
        end = result.end
        result.suggestions.forEach((r) => prev.push(r))
        done(null, prev)
      }, { ...stateInfo, id, strategy })
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
