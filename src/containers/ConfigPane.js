import React, { Component } from 'react'
import { connect } from 'react-redux'
import { saveConfig } from 'actions/progress'
import { toggleConfig } from 'actions/ui'

class TextField extends Component {
  getValue () {
    if (this.props.type === 'number') {
      return parseFloat(this.refs.field.value)
    } else {
      return this.refs.field.value
    }
  }

  render () {
    const { title, placeholder, type, defaultValue, ...details } = this.props
    return (
      <span key={title}>
        <label className='label'> {title} </label>
        <p className='control'>
          <input {...details} className='input' type={type || 'text'} defaultValue={defaultValue} placeholder={placeholder} ref='field' />
        </p>
      </span>
    )
  }
}

class ToggleField extends Component {
  getValue () {
    return this.refs.field.getValue()
  }

  render () {
    const { title, checked } = this.props
    return (
      <OptionsField title={title} options={[{label: 'Yes', key: true}, {label: 'No', key: false}]} selected={checked} ref='field' />
    )
  }
}

class OptionsField extends Component {
  getValue () {
    return this.refs.field.value
  }

  render () {
    const { title, options, selected } = this.props
    return (
      <span key={title}>
        <label className='label'> {title} </label>
        <p className='control'>
          <span className='select'>
            <select defaultValue={selected} ref='field'>
              { options.map((option) => (<option key={option.key} value={option.key} >{option.label}</option>)) }
            </select>
          </span>
        </p>
      </span>
    )
  }
}

const SectionBlock = ({ name, children }) => {
  const blockStyle = {
    marginTop: '10px'
  }
  const blockHeader = {
    fontSize: '1.4rem'
  }
  return (
    <div style={{ marginTop: '20px' }}>
      <h1 style={blockHeader}> {name} </h1>
      <div style={blockStyle}>
        {children}
      </div>
    </div>
  )
}

class ConfigPane extends Component {
  render () {
    const { dispatch, address, config } = this.props
    const style = {
      position: 'absolute',
      top: '10%',
      left: '50%',
      width: '50%',
      height: '80%',
      marginLeft: '-25%',
      zIndex: 700,
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '5px',
      display: 'flex',
      flexDirection: 'column'
    }

    const onSubmit = (e) => {
      e.preventDefault()
      const rr = {}
      Object.keys(this.refs).forEach((key) => {
        const value = this.refs[key].getValue()
        const k = key.split('.')
        switch (k.length) {
          case 1:
            rr[k[0]] = value
            break
          case 2:
            if (!rr[k[0]]) {
              rr[k[0]] = {}
            }
            rr[k[0]][k[1]] = value
            break
          case 3:
            if (!rr[k[0]]) {
              rr[k[0]] = {}
            }
            if (!rr[k[0]][k[1]]) {
              rr[k[0]][k[1]] = {}
            }
            rr[k[0]][k[1]][k[2]] = value
            break
        }
      })
      dispatch(saveConfig(rr))
    }

    return (
      <form style={style}>
        <header style={{ fontSize: '2rem' }}>
          Configuration
        </header>
        <section style={{ flexGrow: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: '400px', margin: 'auto' }}>
            <SectionBlock name='Server'>
              <TextField title='Server Address' defaultValue={address} ref='_.server' />
              <TextField title='Input folder' defaultValue={config.input_path} ref='db.input_path' />
              <TextField title='Backup folder' defaultValue={config.backup_path} ref='backup_path' />
              <TextField title='Destination folder' defaultValue={config.dest_path} ref='dest_path' />
              <TextField title='LIFE folder' defaultValue={config.life_path} ref='life_path' />
            </SectionBlock>

            <SectionBlock name='Database'>
              <TextField title='Database host' defaultValue={config.db.host} ref='db.host' />
              <TextField title='Database name' defaultValue={config.db.name} ref='db.name' />
              <TextField title='Database username' defaultValue={config.db.user} ref='db.user' />
              <TextField title='Database password' defaultValue={config.db.pass} ref='db.pass' />
            </SectionBlock>

            <SectionBlock name='To trip'>
              <TextField title='Trip name format' defaultValue={config.trip_name_format} ref='trip_name_format' />
            </SectionBlock>
            <SectionBlock name='Preprocess'>
              <TextField title='Remove points with acceleration above (m/s2)' defaultValue={config.preprocess.max_acc} type='number' min='0' step='0.10' ref='preprocess.max_acc' />
            </SectionBlock>

            <SectionBlock name='Smoothing'>
              <OptionsField title='Algorithm' options={[{ label: 'Kalman with backwards pass', key: 'inverse' }, { label: 'Kalman with start interpolation', key: '' }]} defaultValue={config.smoothing.algorithm} ref='smoothing.algorithm' />
              <TextField title='Fitting iterations' defaultValue={config.smoothing.iter} ref='smoothing.iter' type='number' min='0' step='1' />
            </SectionBlock>

            <SectionBlock name='Spatiotemporal segmetation'>
              <TextField title='Epsilon' defaultValue={config.segmentation.epsilon} ref='segmentation.epsilon' type='number' min='0' step='0.01' />
              <TextField title='Min. samples' defaultValue={config.segmentation.min_samples} ref='segmentation.min_samples' type='number' min='0' step='1' />
            </SectionBlock>

            <SectionBlock name='Simplification'>
              <TextField title='Max. distance' defaultValue={config.simplification.max_distance} ref='simplification.max_distance' type='number' min='0' step='0.5' />
              <TextField title='Max. time' defaultValue={config.simplification.max_time} ref='simplification.max_time' type='number' min='0' step='0.1' />
            </SectionBlock>

            <SectionBlock name='Location inferring'>
              <TextField title='Max. distance to place' defaultValue={config.location.max_distance} ref='location.max_distance' type='number' min='0' step='0.01' />
              <TextField title='Google Maps key' defaultValue={config.location.google_key} ref='location.google_key' />
            </SectionBlock>

            <SectionBlock name='Transportation inferring'>
              <ToggleField title='Remove stops' defaultValue={config.transportation.remove_stops} ref='transportation.remove_stops' />
              <TextField title='Min. time' defaultValue={config.transportation.min_time} ref='transportation.min_time' type='number' min='0' step='0.01' />
            </SectionBlock>

            <SectionBlock name='Trip learning'>
              <TextField title='Epsilon' defaultValue={config.trip_learning.epsilon} ref='trip_learning.epsilon' type='number' min='0' step='0.01' />
            </SectionBlock>

          </div>
        </section>
        <footer style={{ textAlign: 'right' }} className='control'>
          <button className='button is-link' onClick={() => dispatch(toggleConfig())}>Cancel</button>
          <input type='submit' onClick={onSubmit} className='button' value='Save' />
        </footer>
      </form>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    address: state.get('progress').get('server'),
    config: state.get('progress').get('config').toJS()
  }
}

const CPane = connect(mapStateToProps)(ConfigPane)

export default CPane
