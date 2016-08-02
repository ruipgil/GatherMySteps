import React from 'react'
import { connect } from 'react-redux'
import { ContentState } from 'draft-js'
import SemanticEditor from './SemanticEditor/index.jsx'

import decorators from './utils/decorators'
import suggestionsGetters from './utils/suggestionsGetters'
import createTextRepresentation from './utils/createTextRepresentation'
import { updateLIFE } from 'actions/tracks'

let SE = ({ dispatch, segments, life }) => {
  console.log(life)
  const state = ContentState.createFromText(life)

  return (
    <SemanticEditor
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
    </SemanticEditor>
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
