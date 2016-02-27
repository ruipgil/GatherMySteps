const toggleTrackRenaming = (trackId) => {
  return {
    trackId,
    type: 'TOGGLE_TRACK_RENAMING'
  }
}

export default toggleTrackRenaming
