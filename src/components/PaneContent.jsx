import React from 'react'
import { ANNOTATE_STAGE } from 'constants'
import TrackList from 'containers/TrackList.jsx'
import SemanticEditor from 'components/SemanticEditor.jsx'
import DaysLeft from 'containers/DaysLeft'

const PaneContent = ({ showList, stage }) => {
  let content
  let style = { overflowY: 'auto' }
  if (showList) {
    content = <DaysLeft style={{ flexGrow: 1, overflowY: 'auto' }}/>
  } else if (stage === ANNOTATE_STAGE) {
    content = <SemanticEditor className='is-flexgrow' width='100%' />
    style = {
      ...style,
      overflowX: 'visible',
      paddingTop: '2px',
      minWidth: '100%',
      borderRadius: '0px 3px 3px 0px',
      backgroundColor: 'white'
    }
  } else {
    content = <TrackList className='is-flexgrow' width='100%' />
  }
  return (
    <div className='is-flexgrow is-flex expand' style={style} >
      {content}
    </div>
  )
}

export default PaneContent
