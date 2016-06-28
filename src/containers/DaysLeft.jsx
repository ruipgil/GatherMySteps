import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { changeDayToProcess, reloadQueue } from 'actions/progress'
import AsyncButton from 'components/AsyncButton'

const POINTS_PER_KB = 7.2

const Day = ({ date, gpxs, isSelected, onSelectDay }) => {
  const mDate = moment(date)
  return (
    <div onClick={() => onSelectDay(date)} className='clickable day-left' style={{ marginTop: '0.5rem', padding: '0.2rem', borderRadius: '3px', border: '1px #bbb ' + (isSelected ? 'solid' : 'dashed') }}>
      <div>
        <span>{ mDate.format('ll') }<span style={{ fontSize: '0.8rem', marginLeft: '5px', color: 'gray' }}>{ mDate.fromNow() }</span></span>
      </div>
      <div>
        {
          gpxs.map((gpx) => {
            const size = gpx.get('size') / 1000
            const pointsPredicted = size * POINTS_PER_KB
            return (
              <div style={{ paddingLeft: '1rem', fontSize: '0.9rem' }}>{ moment(gpx.get('start')).format('LT') } • { Math.round(size) }kb • ~{ Math.floor(pointsPredicted) } points</div>
            )
          }).toJS()
        }
      </div>
    </div>
  )
}

let DaysLeft = ({ dispatch, style, remaining, selected, hasUndo }) => {
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
        remaining.map(([day, gpxs]) => {
          return (
            <Day
              date={day}
              gpxs={gpxs}
              isSelected={selected === day}
              onSelectDay={(dayClicked) => {
                if (selected !== dayClicked) {
                  const go = !hasUndo || confirm('Do you wish to change days?\n\nAll changes made to the current day will be lost')
                  if (go) {
                    dispatch(changeDayToProcess(dayClicked))
                  }
                }
              }} />
          )
        })
      }
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    remaining: state.get('progress').get('remainingTracks'),
    selected: state.get('progress').get('daySelected'),
    hasUndo: state.get('tracks').get('history').get('past').count() !== 0
  }
}

DaysLeft = connect(mapStateToProps)(DaysLeft)

export default DaysLeft
