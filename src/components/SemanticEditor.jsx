import React from 'react'
import { connect } from 'react-redux'
import { ContentState } from 'draft-js'
import SemanticEditor from './SemanticEditor/index.jsx'

import decorators from './utils/decorators'
import suggestionsGetters from './utils/suggestionsGetters'
import createTextRepresentation from './utils/createTextRepresentation'
import { updateLIFE } from 'actions/tracks'

let SE = ({ dispatch, segments }) => {
  const state = ContentState.createFromText(createTextRepresentation(segments, dispatch))

  return (
    <SemanticEditor
      state={ state }
      segments={ segments }
      dispatch={ dispatch }
      strategies={ decorators }
      suggestionGetters={ suggestionsGetters }
      onChange={(state) => {
        const { editorState, warning } = state
        dispatch(updateLIFE(editorState.getCurrentContent().getPlainText()), warning)
      }}
      >
    </SemanticEditor>
  )
}

const mapStateToProps = (state) => {
  return {
    segments: state.get('tracks').get('segments')
  }
}

SE = connect(mapStateToProps)(SE)
export default SE
