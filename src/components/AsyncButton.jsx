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
        // this.state.content = content || this.props.children
        // this.setState(this.state)
      })
    }
  }

  onFileRead (text) {
    if (this.props.onRead) {
      this.props.onRead(text, (className, content) => {
        findDOMNode(this.refs.btn).className = this.createClassName(className)
      })
    }
  }

  render () {
    const classes = this.createClassName()
    if (this.props.isFile) {
      const id='fkdhf'
      const onChange = (evt) => {
        const files = evt.target.files // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {
          var reader = new FileReader();
          // Closure to capture the file information.
          reader.onload = ((theFile) => {
            return (e) => {
              const text = e.currentTarget.result
              this.onFileRead(text)
            }
          })(f)

          // read text
          reader.readAsText(f)
        }
      }
      return (
       <div {...this.props} className={classes} ref='btn'>
          <input type='file' id={id} style={{display: 'none'}} onChange={onChange}/>
          <label htmlFor={id}>
            { this.props.children }
          </label>
        </div>
      )
    } else if (this.props.isDiv) {
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
