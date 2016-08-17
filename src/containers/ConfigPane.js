import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  saveConfig,
  loadCanonicalTrips,
  loadCanonicalLocations
} from 'actions/progress'
import { toggleConfig } from 'actions/ui'
import AsyncButton from 'components/AsyncButton'

class TextField extends Component {
  getValue () {
    if (this.props.type === 'number') {
      return parseFloat(this.refs.field.value)
    } else {
      return this.refs.field.value
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
    const { title, options, selected, help } = this.props
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
        <blockquote className='help' style={{ color: 'gray', /* fontSize: '0.9rem', */ marginBottom: '10px' }}>
          {help}
        </blockquote>
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
      // e.preventDefault()
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

    let serverSpecific = <div></div>
    if (config) {
      serverSpecific = (
        <div>
          <SectionBlock name='Folders'>
            <TextField title='Input folder' defaultValue={config.input_path} ref='input_path' help='Path to the folder containing tracks to be processed' />
            <TextField title='Destination folder' defaultValue={config.output_path} ref='output_path' help='Path to folder where the processed tracks wil be saved' />
            <TextField title='Backup folder' defaultValue={config.backup_path} ref='backup_path' help='Path to the folder where the original tracks will be saved' />
            <TextField title='LIFE folder' defaultValue={config.life_path} ref='life_path' help='Path to the folder where each LIFE annotation will be saved. One file per day.' />
            <TextField title='LIFE file' defaultValue={config.life_all} ref='life_all' help='Path to the global file where LIFE annotations are stored. One file contains multiple days. Created if it does not exists.' />
          </SectionBlock>

          <SectionBlock name='Database'>
            <TextField title='Database host' defaultValue={config.db.host} ref='db.host' />
            <TextField title='Database name' defaultValue={config.db.name} ref='db.name' />
            <TextField title='Database username' defaultValue={config.db.user} ref='db.user' />
            <TextField title='Database password' defaultValue={config.db.pass} ref='db.pass' />
          </SectionBlock>

          <SectionBlock name='To trip'>
            <TextField title='Trip name format' defaultValue={config.trip_name_format} ref='trip_name_format' help={
              <span>Format of a trip. It is possible to use <a href='https://docs.python.org/2/library/datetime.html#strftime-strptime-behavior'>date formating</a>.</span>
            } />
          </SectionBlock>

          <SectionBlock name='Smoothing'>
            <OptionsField title='Algorithm' options={[{ label: 'Kalman with backwards pass', key: 'inverse' }, { label: 'Kalman with start interpolation', key: '' }]} defaultValue={config.smoothing.algorithm} ref='smoothing.algorithm' help={
              <span>
                Algorithm to use to smooth tracks. There are two possibilities:
                <ul>
                  <li><i>Kalman with backwards pass</i>: applied the kalman filter two times. One from the start to the end, then from the end to the start. Then, each one are cut in half and spliced together. This method provides better results, but requires more time.</li>
                  <li><i>Kalman with start interpolation</i>: applied the kalman filter one times, but first extrapolates the begining of the track.</li>
                </ul>
              </span>
            } />
            <TextField title='Noise' defaultValue={config.smoothing.noise} ref='smoothing.noise' type='number' min='1' step='1' help='Noise of the points in the track. Higher values yield smoother tracks. If the value is 1 then it is not smoothed.' />
          </SectionBlock>

          <SectionBlock name='Spatiotemporal segmetation'>
            <TextField title='Epsilon' defaultValue={config.segmentation.epsilon} ref='segmentation.epsilon' type='number' min='0' step='0.01' help='Distance epsilon after which points can be clustered into the same stop. Points are clustered based on their spatiotemporal distance. The higher it is the less clusters will exist.'/>
            <TextField title='Min. time' defaultValue={config.segmentation.min_time} ref='segmentation.min_time' type='number' min='0' step='1' help='Minimum time at one place to consider it a stop' />
          </SectionBlock>

          <SectionBlock name='Simplification'>
            <TextField title='Max. distance error' defaultValue={config.simplification.max_dist_error} ref='simplification.max_dist_error' type='number' min='0' step='0.5' help='Maximum distance error, in meters. Higher values give higher compression rates but also more deviations from the original track' />
            <TextField title='Max. speed error' defaultValue={config.simplification.max_speed_error} ref='simplification.max_speed_error' type='number' min='0' step='0.5' help='Maximum speed error, in km/h. Higher values give higher compression rates but also more deviations from the original track' />
            <TextField title='Epsilon' defaultValue={config.simplification.eps} ref='simplification.eps' type='number' min='0' step='0.1' help='Maximum distance, in degrees, to compress a track solely based on its topology' />
          </SectionBlock>

          <SectionBlock name='Location inferring'>
            <TextField title='Max. distance to place' defaultValue={config.location.max_distance} ref='location.max_distance' type='number' min='0' step='0.01' help='Radius to other locations, in meters, for them to be considered the same.' />
            <TextField title='Limit' defaultValue={config.location.limit} ref='location.limit' type='number' min='0' step='0.01' help='Maximum suggestions to present for the location' />
            <TextField title='Min samples' defaultValue={config.location.min_samples} ref='location.min_samples' type='number' min='0' step='1' />
            <TextField title='Google Places key' defaultValue={config.location.google_key} ref='location.google_key' help={
              <span>
                <a href='https://developers.google.com/places/web-service/'>Google Places API key</a> to query for unknown places.
              </span>
            } />
          </SectionBlock>

          <SectionBlock name='Transportation inferring'>
            <TextField title='Min. time' defaultValue={config.transportation.min_time} ref='transportation.min_time' type='number' min='0' step='0.01' help='Minimum time between changes of transportation mode, in seconds.' />
            <TextField title='Classifier path' defaultValue={config.transportation.classifier_path} ref='transportation.classifier_path' help='Path to the file with the classifier to use when evaluating transportation modes' />
          </SectionBlock>

          <SectionBlock name='Trip learning'>
            <TextField title='Epsilon' defaultValue={config.trip_learning.epsilon} ref='trip_learning.epsilon' type='number' min='0' step='0.01' />
          </SectionBlock>
        </div>
      )
    }

    return (
      <div style={style}>
        <header style={{ fontSize: '2rem' }}>
          Configuration
          <a className='button is-small' onClick={() => dispatch(loadCanonicalTrips())}>Load canonical trips</a>
          <a className='button is-small' onClick={() => dispatch(loadCanonicalLocations())}>Load canonical locations</a>
        </header>
        <section style={{ flexGrow: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: '400px', margin: 'auto' }}>
            <SectionBlock name='Server Address'>
              <TextField title='' defaultValue={address} ref='_.server' />
            </SectionBlock>

            { serverSpecific }

          </div>
        </section>
        <footer style={{ textAlign: 'right' }} className='control'>
          <button className='button is-link' onClick={(e) => {
            e.preventDefault()
            dispatch(toggleConfig())
          }}>Cancel</button>
          <AsyncButton onClick={(e, modifier) => {
            modifier('is-loading')
            onSubmit()
            modifier()
          }} > Save </AsyncButton>
        </footer>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const serverConfig = state.get('progress').get('config')
  return {
    address: state.get('progress').get('server'),
    config: serverConfig ? serverConfig.toJS() : null
  }
}

const CPane = connect(mapStateToProps)(ConfigPane)

export default CPane
