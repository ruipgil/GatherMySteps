import React from 'react'
import AlertBox from 'containers/AlertBox'
import SidePane from 'containers/SidePane'
import ConfigPane from 'containers/ConfigPane'
import LeafletMap from 'containers/LeafletMap'
import ProgressBar from 'components/ProgressBar'

const GMS = !process.env.BUILD_GPX

const GMS_ATTRIBUTION = (
  <a id='title' href='https://github.com/ruipgil/GatherMySteps' style={{ fontSize: '1rem', marginTop: '-0.7rem' }}>
    by GatherMySteps
  </a>
)
const TITLE = GMS ? 'GatherMySteps' : <a href='./'>GPXplorer</a>

const Container = ({ keyHandler, downKeyHandler, showConfig, step }) => {
  return (
    <div id='container' onKeyUp={keyHandler} onKeyDown={downKeyHandler} >
      { showConfig ? <ConfigPane /> : null }
      <AlertBox />
      <div id='float-container'>
        <div>
          <div id='title'>{ TITLE }</div>
          { GMS ? <ProgressBar state={step} /> : GMS_ATTRIBUTION }
        </div>
        <SidePane />
      </div>
      <LeafletMap />
    </div>
  )
}

export default Container
