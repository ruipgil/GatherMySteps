import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'

export default class AsyncButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      className: ''
    }
  }

  createClassName (additional) {
    const { disabled, className, withoutBtnClass } = this.props
    return [withoutBtnClass ? null : 'button', disabled ? 'is-disabled' : null, className, additional]
    .filter((x) => x)
    .join(' ')
  }

  onClick (e) {
    if (this.props.onClick) {
      this.props.onClick(e, (className, content) => {
        findDOMNode(this.refs.btn).className = this.createClassName(className)
        console.log(this.createClassName(className))
        // this.state.content = content || this.props.children
        // this.setState(this.state)
      })
    }
  }

  render () {
    const classes = this.createClassName()
    if (this.props.isDiv) {
      return (
        <div {...this.props} className={classes} onClick={this.onClick.bind(this)} ref='btn'>
          { this.props.children }
        </div>
      )
    } else {
      return (
        <a {...this.props} className={classes} onClick={this.onClick.bind(this)} ref='btn'>
          { this.props.children }
        </a>
      )
    }
  }
}
