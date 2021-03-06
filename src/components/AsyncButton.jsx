import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'

export default class AsyncButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      className: '',
      content: null
    }
  }

  createClassName (additional, filter = () => (true)) {
    const { disabled, className, withoutBtnClass } = this.props
    return [withoutBtnClass ? null : 'button', disabled ? 'is-disabled' : null, className, additional]
    .filter((x) => x)
    .filter(filter)
    .join(' ')
  }

  onClick (e) {
    if (this.props.onClick) {
      this.props.onClick(e, (className, filter, content) => {
        findDOMNode(this.refs.btn).className = this.createClassName(className, filter)
        this.state.content = content
        this.setState(this.state)
      })
    }
  }

  onFileRead (text) {
    if (this.props.onRead) {
      this.props.onRead(text, (className, filter) => {
        findDOMNode(this.refs.btn).className = this.createClassName(className, filter)
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
            { this.state.content || this.props.children }
          </label>
        </div>
      )
    } else if (this.props.isDiv) {
      return (
        <div {...this.props} className={classes} onClick={this.onClick.bind(this)} ref='btn'>
          { this.state.content || this.props.children }
        </div>
      )
    } else {
      return (
        <a {...this.props} className={classes} onClick={this.onClick.bind(this)} ref='btn'>
          { this.state.content || this.props.children }
        </a>
      )
    }
  }
}
