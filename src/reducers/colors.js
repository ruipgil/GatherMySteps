// from http://colorbrewer2.org/?type=qualitative&scheme=Dark2&n=8
const _COLORS = ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666']
const L = _COLORS.length

const colors = (i) => {
  return _COLORS[i % L]
}

export default colors
