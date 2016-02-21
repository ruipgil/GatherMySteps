import moment from 'moment'
import { GXParser } from 'gxparser'

function loadFiles (files, cb) {
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
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
      cb(gpx, file)
    }
  }
}

export default loadFiles
