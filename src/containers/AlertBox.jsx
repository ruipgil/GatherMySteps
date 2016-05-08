import React from 'react'
import { connect } from 'react-redux'
import { removeAlert } from 'actions/ui'

const mapType = {
  'warning': 'is-warning',
  'success': 'is-success',
  'error': 'is-danger'
}

const ALERT_TIME = 5000

let AlertBox = ({ dispatch, alerts }) => {
  const style = {
    position: 'absolute',
    top: '10px',
    left: '50%',
    width: '50%',
    marginLeft: '-25%',
    zIndex: 700
  }

  const deleteAlert = (alert) => {
    dispatch(removeAlert(alert))
  }

  return (
    <div style={style}>
      {
        alerts.map((alert) => {
          setTimeout(() => deleteAlert(alert), alert.duration * 1000 || ALERT_TIME)
          return (
            <div className={'notification ' + mapType[alert.type]}>
              <button className='delete' onClick={() => deleteAlert(alert)}></button>
              { alert.message }
            </div>
          )
        })
      }
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    alerts: state.get('ui').get('alerts') || []
  }
}

AlertBox = connect(mapStateToProps)(AlertBox)

export default AlertBox
