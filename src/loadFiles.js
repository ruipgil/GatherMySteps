import moment from 'moment'
import { map } from 'async'
import { GXParser } from 'gxparser'

function loadFiles (files, cb) {
  map(files, (file, done) => {
    /*global FileReader*/
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onloadend = () => {
      let gpx = GXParser(reader.result)
      gpx.trk = gpx.trk.map((track) => {
        return {
          trkseg: track.trkseg.map((segment) => {
            return {
              trkpt: segment.trkpt.map((point) => {
                return {
                  lat: Number(point.lat),
                  lon: Number(point.lon),
                  time: moment(point.time[0])
                }
              })
            }
          })
        }
      })
      done(null, { gpx, name: file.name })
    }
  }, (_, result) => cb(result))
}

export default loadFiles
