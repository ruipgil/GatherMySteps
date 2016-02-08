import {GXParser} from 'gxparser'
import GPXToLayers from './gpxToLayers.js'

export default function loadFiles(files, cb) {

  for (var i=0; i<files.length; i++) {
    var file = files[i]
    var reader = new FileReader()
    reader.readAsText(file)
    reader.onloadend = function() {
      var gpx = GXParser(reader.result)
      /*var layers = GPXToLayers(gpx)
      cb(layers)*/
      cb(gpx)
    }
  }
}
