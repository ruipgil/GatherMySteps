import { TileLayer } from 'leaflet'

export default (map) => {
  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  var osm = new TileLayer(osmUrl, {attribution: osmAttrib, detectRetina: true, maxZoom: 22, maxNativeZoom: 18})
  map.addLayer(osm)

  /* const ggl = new Google()
     var layersControl = new Control.Layers({
     'OpenStreetMaps': osm,
     'OpenStreetMaps2': osm2,
     'Google Maps: Terrain': new Google('google_terrain'),
     'Google Maps: Sattelite': ggl
     }, {})
     layersControl.addTo(this.map)*/
}
