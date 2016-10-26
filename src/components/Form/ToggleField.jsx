import React, { Component } from 'react'
import OptionsField from './OptionsField'

export default class ToggleField extends Component {
  getValue () {
    return this.refs.field.getValue() === 'true'
  }

  render () {
    const { title, checked } = this.props
    return (
      <OptionsField title={title} options={[{label: 'Yes', key: true}, {label: 'No', key: false}]} defaultValue={String(checked)} ref='field' type='boolean' />
    )
  }
}
