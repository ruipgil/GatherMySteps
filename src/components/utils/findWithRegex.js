export default function findWithRegex (regex, contentBlock, callback, mi = 1, log = null) {
  if (log) {
    console.log(log)
    console.log(regex)
  }
  const text = contentBlock.getText()
  let matchArr, start, matched
  if (log) {
    // console.log(regex.exec(text))
  }
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index
    matched = matchArr[mi]
    if (log) {
      console.log('matched: "%s"', matched)
      console.log('index %d', matchArr.index)
    }

    for (let i = 1; i < mi; i++) {
      start += matchArr[i].length || 0
    }
    const end = start + matched.length
    if (log) {
      console.log('matching %s %s %s', matched, start, end)
      console.log('text: %s', text)
      console.log('substring: "%s"', text.substr(start, end))
      console.log('rest: "%s"', text.substr(0, start))
    }

    callback(start, end)
  }
}
