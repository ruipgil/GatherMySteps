import React from 'react'
import { connect } from 'react-redux'
import { ContentState } from 'draft-js'
import Editor from 'Editor'
import { setTransportationModes } from 'actions/segments'

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
      onChange={(stateEditor, ast) => {
        const modes = []
        const isValidTMode = (mode) => {
          return ['foot', 'vehicle', 'train', 'boat', 'airplane']
            .indexOf(mode.toLocaleLowerCase()) !== -1
        }
        const extractTMFromDetails = (details, references) => {
          return details
            .filter((detail) => {
              if (detail.type === 'Tag') {
                return isValidTMode(detail.value)
              }
              return false
            })
            .map((detail) => ({
              label: detail.value.toLocaleLowerCase(),
              references
            }))
        }

        ast.blocks
          .filter((block) => block.type === 'Trip')
          .forEach((block) => {
            if (block.tmodes) {
              block.tmodes.forEach((mode) => {
                const { references } = mode
                modes.push(...extractTMFromDetails(mode.details, references))
              })
            }
            modes.push(...extractTMFromDetails(block.details, block.references))
          })

        const mappedModes = modes.map((mode) => ({
          label: mode.label,
          to: mode.references.to,
          from: mode.references.from
        }))
        dispatch(setTransportationModes(mappedModes))
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
