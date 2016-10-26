import React, { Component } from 'react'

export default class OptionsField extends Component {
  getValue () {
    return this.refs.field.value
  }

  render () {
    const { title, options, defaultValue, help } = this.props
    return (
      <span key={title}>
        <label className='label'> {title} </label>
        <p className='control'>
          <span className='select'>
            <select defaultValue={defaultValue} ref='field'>
              { options.map((option) => (<option key={option.key} value={option.key} >{option.label}</option>)) }
            </select>
          </span>
        </p>
        <blockquote className='help' style={{ color: 'gray', /* fontSize: '0.9rem', */ marginBottom: '10px' }}>
          {help}
        </blockquote>
      </span>
    )
  }
}
