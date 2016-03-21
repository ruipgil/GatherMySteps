import moment from 'moment'
import ReactSlider from 'react-slider'
import React, { Component } from 'react'

export default class TimeSlider extends Component {
  constructor (props) {
    super(props)
    this.state = {
      left: 0,
      right: 100
    }
    this.timer = null
  }

  onChange (value) {
    this.setState({
      left: value[0],
      right: value[1]
    })

    if (this.props.onChange) {
      const { lower, upper } = this.getDates()
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.props.onChange(lower, upper)
      }, 100)
    }
  }

  getDates () {
    const start = this.props.start.valueOf()
    const diff = this.props.end.diff(this.props.start)

    const leftRatio = this.state.left / 100
    const rightRatio = this.state.right / 100

    const lower = moment(start + diff * leftRatio)
    const upper = moment(start + diff * rightRatio)
    return {
      lower,
      upper
    }
  }

  render () {
    const { lower, upper } = this.getDates()

    return (
      <div style={{ fontSize: '0.8rem' }}>
        <ReactSlider defaultValue={[this.state.left, this.state.right]} withBars onChange={this.onChange.bind(this)} />
        <div className='navbar'>
          <div className='navbar-left'>
            { lower.format('lll') }
          </div>
          <div className='navbar-right'>
            { upper.format('lll') }
          </div>
        </div>
      </div>
    )
  }
}
