export default function findSuggestions (text, strategies) {
  let begin = 0
  let end = 0
  const suggestions = strategies.reduce((prev, e) => {
    const { suggester, strategy } = e
    const found = strategy(text)
    if (found) {
      const result = suggester(found)
      begin = result.begin
      end = result.end
      result.suggestions.forEach((r) => prev.push(r))
      return prev
    }
    return prev
  }, [])
  return {
    suggestions,
    begin,
    end
  }
}
