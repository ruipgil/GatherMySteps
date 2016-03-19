import moment from 'moment'

const sample = [
  { lat: 1, lon: 1, time: moment().add(1, 's') },
  { lat: 1.2, lon: 1, time: moment().add(2, 's') },
  { lat: 1.3, lon: 1, time: moment().add(4, 's') },
  { lat: 1.3, lon: 1.1, time: moment().add(8, 's') },
  { lat: 1.4, lon: 1.1, time: moment().add(10, 's') }
]

export default sample
