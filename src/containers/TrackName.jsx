import moment from 'moment'
import React, { Component } from 'react'

const GMS = !process.env.BUILD_GPX
const dateFormatter = (name) => {
  return moment(name.slice(0, -4)).format('ddd, MMM Do YYYY')
}

export default class TrackName extends Component {
  constructor (props) {
    super(props)
    this.state = this.initialState()
  }

  initialState () {
    return {
      renaming: false,
      name: process.env.BUILD_GPX
        ? (this.props.track.get('name') || 'Untitled.gpx')
        : dateFormatter(this.props.track.get('name'))
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.track !== this.props.track) {
      this.setState(this.initialState())
    }
  }

  updateName (e) {
    this.state.name = e.target.value
    this.setState(this.state)
  }

  toggleEditing () {
    if (!this.props.editable) {
      if (this.props.onClick) {
        this.props.onClick()
      }
      return
    }

    if (this.state.renaming) {
      this.props.onRename(this.state.name)
    }
    this.state.renaming = !this.state.renaming
    this.setState(this.state)
  }

  render () {
    const { renaming, name } = this.state
    const { daysLeft, onDownload } = this.props
    const toggleEditing = this.toggleEditing.bind(this)
    if (renaming) {
      return (
        <div className='control is-grouped has-addons'>
          <input className='input' type='text' value={name} onChange={this.updateName.bind(this)} />
          <a className='button is-info' onClick={toggleEditing}>
            <i className='fa fa-check' />
          </a>
        </div>
      )
    } else {
      let downloadButton = null
      if (process.env.BUILD_GPX) {
        downloadButton = (
          <a className='float-right clickable icon' onClick={onDownload}>
            <i className='fa fa-download' style={{ color: 'black' }} />
          </a>
        )
      }
      return (
        <div>
          { downloadButton }
          <a onClick={toggleEditing} style={{ color: '#666', display: 'flex', alignItems: 'flex-start' }}>
            <span style={{}}>{name}</span>
            {
              GMS
              ? <span style={{ fontSize: '0.9rem', textDecoration: 'underline', fontWeight: 'bold', color: '#777' }}>{ daysLeft }</span>
              : null
            }
          </a>
        </div>
      )
    }
  }
}
