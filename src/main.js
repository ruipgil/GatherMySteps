var nSegments = 0
function GPXToLayers(gpx) {
  // http://colorbrewer2.org/?type=qualitative&scheme=Set1&n=4
  var colors = ['#e41a1c','#377eb8','#4daf4a','#984ea3']
  var maxLat = -Infinity, maxLon = -Infinity, minLat = Infinity, minLon = Infinity;
  var groups = gpx.trk.map(function(track) {
    return track.trkseg.map(function(segment) {
      var color = colors[(nSegments++)%colors.length]
      var points = L.layerGroup()
      var line = L.polyline([], {
        color: color
      })
      var pointOptions = {
        color: color,
        fillOpacity: 1,
        stroke: false
      }
      segment.trkpt.forEach(function(point) {
        line.addLatLng([point.lat, point.lon])
        points.addLayer(L.circle([point.lat, point.lon], 8, pointOptions))
        maxLat = max(maxLat, point.lat)
        minLat = min(minLat, point.lat)

        maxLon = max(maxLon, point.lon)
        minLon = min(minLon, point.lon)
      })
      return L.layerGroup([line, points])
    })
  })

  return {
    layers: groups,
    bounds: [[minLat, minLon], [maxLat, maxLon]]
  }
}

var drop = document.getElementById('container');
function cancel(e) {
  e.preventDefault()
  return false;
}
drop.addEventListener('dragover', cancel);
drop.addEventListener('dragenter', cancel);
drop.addEventListener('drop', function(e) {
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
          segment.addTo(map)
        })
      })
      map.fitBounds(layers.bounds)
    }
  };
});

var map = L.map('map').fitBounds([[63.860035895395306, 235.89843749999997], [-45.58328975600631, -214.1015625]])
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
