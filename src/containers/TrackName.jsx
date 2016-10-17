import React, { Component } from 'react'

export default class TrackName extends Component {
  constructor (props) {
    super(props)
    this.state = this.initialState()
  }

  initialState () {
    return {
      renaming: false,
      name: this.props.track.get('name') || 'Untitled.gpx'
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
    if (this.state.renaming) {
      this.props.onRename(this.state.name)
    }
    this.state.renaming = !this.state.renaming
    this.setState(this.state)
  }

  render () {
    const { renaming, name } = this.state
    const { onDownload } = this.props
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
            <i className='fa fa-download' />
          </a>
        )
      }
      return (
        <div>
          { downloadButton }
          <a onClick={toggleEditing} style={{ color: '#666' }}>{name}</a>
        </div>
      )
    }
  }
}
