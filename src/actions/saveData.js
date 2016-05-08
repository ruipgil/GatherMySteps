export default (function () {
  let a = document.createElement('a')
  document.body.appendChild(a)
  a.style = 'display: none'
  return function (data, fileName) {
    /*global Blob*/
    let blob = new Blob([data], {type: 'octet/stream'})
    let url = window.URL.createObjectURL(blob)
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
  }
}())
