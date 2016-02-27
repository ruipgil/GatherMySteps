const updateTrackName = (trackId, newName) => {
  return {
    trackId,
    name: newName,
    type: 'UPDATE_TRACK_NAME'
  }
}

export default updateTrackName
