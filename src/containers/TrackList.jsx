import React from 'react'
import { connect } from 'react-redux'
import TrackRepresentation from '../components/TrackRepresentation.jsx'

let TrackList = ({ dispatch, tracks, segments, className }) => {
  const findStart = (seg) =>
    seg.get('segments').map((s) => segments.get(s).get('start')).sort((_a, _b) => _a.get('start').diff(_b.get('start'))).get(0)

  if (tracks.count() !== 0) {
    return (
      <ul className={className}>
      {
        tracks
        .sort((a, b) => {
          const aStart = findStart(a)
          const bStart = findStart(b)
          return aStart.get('start').diff(bStart.get('start'))
        })
        .map((track, i) => {
          const trackSegments = track.get('segments').map((id) => segments.get(id))
          return <TrackRepresentation dispatch={dispatch} track={track} segments={trackSegments} key={i} />
        })
      }
      </ul>
    )
  } else {
    return (
      <div className='dropInfo'>
        Drop .gpx files here
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    tracks: state.get('tracks').get('tracks'),
    segments: state.get('tracks').get('segments')
  }
}

TrackList = connect(mapStateToProps)(TrackList)

export default TrackList
