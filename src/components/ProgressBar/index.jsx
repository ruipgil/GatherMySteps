import React from 'react'
import ProgressBall from './ProgressBall'
import ProgressRuler from './ProgressRuler'

const BALL_DEFAULT_STYLE = {
  width: '16px',
  height: '16px',
  display: 'inline-block',
  backgroundColor: 'white',
  zIndex: 100,
  boxShadow: '#888 0px 0px 10px'
}

const RULER_DEFAULT_STYLE = {
}


const ProgressBar = ({ state, ballStyle, rulerStyle, children }) => {
  ballStyle = ballStyle || BALL_DEFAULT_STYLE
  rulerStyle = rulerStyle || RULER_DEFAULT_STYLE
  const borderColor = '#97cd76'

  const p = 20
  const rulerBeforeStyle = { background: borderColor, boxShadow: '#888 0px 0px 10px' }
  const rulerAfterStyle = { background: 'white', boxShadow: '#888 0px 0px 10px' }
  const rulerSelectedStyle = {
    background: 'linear-gradient(to right, ' + borderColor + ' 0%,' + borderColor + ' ' + p + '%,#ffffff ' + p + '%,#ffffff 100%)',
    boxShadow: '#888 0px 0px 10px'
  }

  const ballAfterStyle = { ...ballStyle, border: '4px solid white', backgroundColor: 'white' }
  const ballSelectedStyle = { ...ballStyle, border: '4px solid ' + borderColor, width: '20px', height: '20px' }
  const ballBeforeStyle = { ...ballStyle, border: '4px solid ' + borderColor, backgroundColor: borderColor }

  const labelBaseStyle = { color: 'rgba(255, 255, 255, 0.5)', textShadow: 'rgba(68, 68, 68, 0.5) 0px 0px 10px', fontWeight: 'bold' }
  const labelBeforeStyle = labelBaseStyle
  const labelAfterStyle = labelBeforeStyle
  const labelSelectedStyle = { ...labelBaseStyle, color: 'white', textShadow: '#444 0px 0px 10px' }

  const _steps = children.reduce((prev, step, i) => {
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
            return (<ProgressBall style={stl} key={i} />)
          } else {
            if (i === 0 || (arr.length - 1) === i) {
              return (
                <div style={{ flexGrow: 2 }} key={i}></div>
              )
            } else {
              let stl = rulerBeforeStyle
              const s = (i / 2) - 1
              if (state === s) {
                stl = rulerSelectedStyle
              } else if (state < s) {
                stl = rulerAfterStyle
              }
              return (<ProgressRuler style={stl} key={i} />)
            }
          }
        })
      }
    </div>
  )

  const forceEqualSize = true
  const equalSize = (100 / children.length) + '%'

  const stepLabels = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {
        children.reduce((result, step, i) => {
          if (step) {
            let stl = labelBeforeStyle
            const s = i
            if (state === s) {
              stl = labelSelectedStyle
            } else if (state < s) {
              stl = labelAfterStyle
            }
            result.push(
              <div key={i + 'x'} style={{ flexGrow: 2, textAlign: 'center', width: forceEqualSize ? equalSize : null, ...stl }}>{ step }</div>
              )
            if (children.length - 1 !== i) {
              result.push(
                <div style={{ flexGrow: 2 }} key={i + '_'}></div>
              )
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

export default ProgressBar
