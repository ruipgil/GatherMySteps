import React, { Component } from 'react'

export default class TextField extends Component {
  getValue () {
    const { type } = this.props
    const { value } = this.refs.field
    switch (type) {
      case 'number': return parseFloat(value)
      case 'boolean': return value === 'true'
      default: return value
    }
  }

  render () {
    const { title, placeholder, type, defaultValue, help, ...details } = this.props

    return (
      <span key={title}>
        <label className='label'> {title} </label>
        <p className='control has-addons' style={{ marginBottom: '0' }}>
          <input {...details} className='input is-expanded' type={type || 'text'} defaultValue={defaultValue} placeholder={placeholder} ref='field' />
        </p>
        <blockquote className='help' style={{ color: 'gray'/* , fontSize: '0.9rem' */, marginBottom: '10px' }}>
          {help}
        </blockquote>
      </span>
    )
  }
}
