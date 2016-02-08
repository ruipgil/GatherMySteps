import {GXParser} from 'gxparser'
import GPXToLayers from './gpxToLayers.js'
import {dispatch} from 'redux'
import {addTrack} from './actions.jsx'

function cancel(e) {
  e.preventDefault()
  return false;
}

export default function(elm) {
  elm.addEventListener('dragover', cancel);
  elm.addEventListener('dragenter', cancel);
  elm.addEventListener('drop', function(e) {
    e.preventDefault();
    var dt = e.dataTransfer
    var files = dt.files

    for (var i=0; i<files.length; i++) {
      var file = files[i]
      var reader = new FileReader()
      reader.readAsText(file)
      reader.onloadend = function() {
        var gpx = GXParser(reader.result)
        var layers = GPXToLayers(gpx)
        layers.layers.forEach(function(track) {
          track.forEach(function(segment) {
            //segment.addTo(map)
            dispatch(addTrack(segment))
          })
        })
        //map.fitBounds(layers.bounds)
      }
    };
  });
}
