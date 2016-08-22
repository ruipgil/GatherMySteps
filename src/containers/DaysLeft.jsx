import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { changeDayToProcess, reloadQueue, dismissDay } from 'actions/progress'
import AsyncButton from 'components/AsyncButton'

const POINTS_PER_KB = 7.2

const GPXStyle = { paddingLeft: '1rem', fontSize: '0.9rem' }
const GPXOfDay = ({ date, size }) => {
  size = size / 1000
  date = moment(new Date(date))
  const pointsPredicted = Math.floor(size * POINTS_PER_KB)
  return (
    <div style={GPXStyle}>
      { date.format('LT') } • { Math.round(size) }kb • ~{ pointsPredicted } points
    </div>
  )
}

const crossStyle = {
  float: 'right',
  textDecoration: 'none',
  marginTop: '-4px'
}

const Day = ({ date, gpxs, isSelected, onSelectDay, onDismiss }) => {
  const mDate = moment(date)
  return (
    <div className='clickable day-left' style={{ marginTop: '0.5rem', padding: '0.2rem', borderRadius: '3px', border: '1px #bbb ' + (isSelected ? 'solid' : 'dashed') }}>
      <a className='button is-link is-small is-white' style={crossStyle} title='Dismiss day. Does not delete tracks.' onClick={onDismiss}>
        <i className='fa fa-times' style={{ fontSize: '0.7rem' }}/>
      </a>
      <div>
        <span>{ mDate.format('ll') }<span style={{ fontSize: '0.8rem', marginLeft: '5px', color: 'gray' }}>{ mDate.fromNow() }</span></span>
      </div>
      <div>
        {
          gpxs.map((gpx, key) => {
            return <GPXOfDay key={key} date={gpx.get('start')} size={gpx.get('size')} />
          }).toJS()
        }
      </div>
    </div>
  )
}

let DaysLeft = ({ dispatch, style, remaining, selected, hasChanges, lifesExistent }) => {
  const refresh = (
    <AsyncButton
      className='fa fa-refresh'
      style={{ float: 'right', border: '0px' }}
      onClick={(e, modifier) => {
        modifier('is-loading')
        dispatch(reloadQueue())
          .then(() => modifier())
      }}
      title='Scan input folder for more tracks'/>
  )

  return (
    <div style={{...style}} title='Click to change the day to process'>
      <div style={{ fontSize: '1.5rem' }}>Days left to process { refresh }</div>
      {
        lifesExistent.map((file) => {
          return (
            <div style={{ marginTop: '0.5rem', padding: '0.2rem', borderRadius: '3px', border: '1px #bbb dashed', opacity: 0.7 }}>
              <i>{ file }</i>
            </div>
          )
        })
      }
      {
        remaining.map(([day, gpxs], i) => {
          const dismiss = (e) => {
            e.preventDefault()
            dispatch(dismissDay(day))
          }
          return (
            <AsyncButton key={i} isDiv={true} withoutBtnClass={true} onClick={(e, modifier) => {
              if (selected !== day) {
                /*global confirm*/
                const go = !hasChanges || confirm('Do you wish to change days?\n\nAll changes made to the current day will be lost')
                if (go) {
                  modifier('loaderr')
                  dispatch(changeDayToProcess(day))
                    .then(() => modifier())
                }
              }
            }}>
              <Day
                gpxs={gpxs} date={day}
                isSelected={selected === day} onDismiss={dismiss}/>
            </AsyncButton>
          )
        })
      }
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    lifesExistent: state.get('progress').get('lifeQueue') || [],
    remaining: state.get('progress').get('remainingTracks'),
    selected: state.get('progress').get('daySelected'),
    hasChanges: state.get('tracks').get('history').get('past').count() !== 0 || state.get('progress').get('step') !== 0
  }
}

DaysLeft = connect(mapStateToProps)(DaysLeft)

export default DaysLeft
