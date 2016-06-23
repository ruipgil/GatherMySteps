import React from 'react'
import { connect } from 'react-redux'

let ProgressBar = ({ state, children }) => {
  const none = {}
  const active = { className: 'active' }
  const highlight = { className: 'hl' }
  const TIP_SIZE = 0
  const width = ((100 - TIP_SIZE) / 5) + '%'

  const selector = (current, index) => {
    if (current === index) {
      return highlight
    } else if (current > index) {
      return active
    } else {
      return none
    }
  }
  return (
    <div>
    <div>
      <ul className='progressbar'>
        <li { ...active } style={{ width }}></li>
        <li { ...selector(state, 0) } style={{width}}></li>
        <li { ...selector(state, 1) } style={{width}}></li>
        <li { ...selector(state, 2) } style={{width}}></li>
        <li { ...none } style={{width}}></li>
      </ul>
    </div>
    <div className='pg-text'>
      <span { ...selector(state, 0) }>Preview</span>
      <span { ...selector(state, 1) }>Adjust</span>
      <span { ...selector(state, 2) }>Annotate</span>
    </div>
  </div>

  )
}

const STEPS = [
  { name: 'Preview' },
  { name: 'Adjust' },
  { name: 'Annotate' }
]

const ProgressBall = ({ style }) => {
  return (
    <div style={{ ...style, borderRadius: '50%' }}></div>
  )
}

const ProgressRuler = ({ style }) => {
  const _style = { flexGrow: 2, display: 'inline-block' }
  return (
    <div style={_style}>
      <div style={{ backgroundColor: 'white', width: '110%', height: '5px', marginLeft: '-5%', ...style }}>
      </div>
    </div>
  )
}

const BALL_STYLE = {
  width: '16px',
  height: '16px',
  display: 'inline-block',
  backgroundColor: 'white',
  zIndex: 100
}

ProgressBar = ({ state, ballStyle, children }) => {
  ballStyle = ballStyle || BALL_STYLE
  const borderColor = '#97cd76'

  const p = 20
  const rulerBeforeStyle = { background: borderColor }
  const rulerAfterStyle = { background: 'white' }
  const rulerSelectedStyle = { background: 'linear-gradient(to right, ' + borderColor + ' 0%,' + borderColor + ' ' + p + '%,#ffffff ' + p + '%,#ffffff 100%)' }

  const ballAfterStyle = { ...ballStyle, border: '4px solid white', backgroundColor: 'white' }
  const ballSelectedStyle = { ...ballStyle, border: '4px solid ' + borderColor, width: '20px', height: '20px' }
  const ballBeforeStyle = { ...ballStyle, border: '4px solid ' + borderColor, backgroundColor: borderColor }

  const labelBaseStyle = { color: 'rgba(255, 255, 255, 0.5)', textShadow: 'rgba(68, 68, 68, 0.5) 0px 0px 10px', fontWeight: 'bold' }
  const labelBeforeStyle = labelBaseStyle
  const labelAfterStyle = labelBeforeStyle
  const labelSelectedStyle = { ...labelBaseStyle, color: 'white', textShadow: '#444 0px 0px 10px' }

  const Spacer = (
    <div style={{ flexGrow: 2 }}></div>
  )
  const _steps = STEPS.reduce((prev, step, i) => {
    prev.push(step)
    prev.push(null)
    return prev
  }, [null])
  const stepPointers = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {
        _steps.map((step, i, arr) => {
          if (step) {
            let stl = ballBeforeStyle
            const s = (i / 2) - 0.5
            if (state === s) {
              stl = ballSelectedStyle
            } else if (state < s) {
              stl = ballAfterStyle
            }
            return (<ProgressBall style={stl} />)
          } else {
            if (i === 0 || (arr.length - 1) === i) {
              return Spacer
            } else {
              let stl = rulerBeforeStyle
              const s = (i / 2) - 1
              if (state === s) {
                stl = rulerSelectedStyle
              } else if (state < s) {
                stl = rulerAfterStyle
              }
              console.log(state, s, stl)
              return (<ProgressRuler style={stl} />)
            }
          }
        })
      }
    </div>
  )

  const forceEqualSize = true
  const equalSize = (100 / STEPS.filter((s) => s && s.name).length) + '%'
  console.log(equalSize)

  const stepLabels = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {
        STEPS.reduce((result, step, i) => {
          if (step) {
            let stl = labelBeforeStyle
            const s = i
            if (state === s) {
              stl = labelSelectedStyle
            } else if (state < s) {
              stl = labelAfterStyle
            }
            result.push(
              <div style={{ flexGrow: 2, textAlign: 'center', width: forceEqualSize ? equalSize : null, ...stl }}>{ step.name }</div>
              )
            if (STEPS.length - 1 !== i) {
              result.push(Spacer)
            }
          }
          return result
        }, [])
      }
    </div>
  )

  return (
    <div>
      { stepPointers }

      { stepLabels }
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    state: state.get('progress').get('step') || 0
  }
}

ProgressBar = connect(mapStateToProps)(ProgressBar)

export default ProgressBar
