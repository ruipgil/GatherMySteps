import React from 'react'
import { connect } from 'react-redux'
import { ContentState } from 'draft-js'
import Editor from 'Editor'

import decorators from 'Editor/decorators'
import suggestionsGetters from 'Editor/suggestionsGetters'
// import { updateLIFE } from 'actions/tracks'

let SE = ({ dispatch, segments, life }) => {
  const state = ContentState.createFromText(life)

  return (
    <Editor
      state={ state }
      segments={ segments }
      dispatch={ dispatch }
      strategies={ decorators }
      suggestionGetters={ suggestionsGetters }
      onChange={(state) => {
        const { editorState, warning } = state
        // dispatch(updateLIFE(editorState.getCurrentContent().getPlainText()), warning)
      }}
      >
    </Editor>
  )
}

const mapStateToProps = (state) => {
  return {
    segments: state.get('tracks').get('segments'),
    life: state.get('progress').get('initLIFE') || ''
  }
}

SE = connect(mapStateToProps)(SE)
export default SE
