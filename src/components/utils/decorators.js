import React from 'react'
import { Entity } from 'draft-js'

import {
  highlightSegment,
  dehighlightSegment
} from 'actions/ui'

const TimeSpan = (props) => {

  const { dispatch, references } = Entity.get(props.entityKey).getData()
  // const segmentsToHighlight = [references.from, references.to].filter((x) => x).map((x) => x.segmentId)
  const onMouseEnter = () => {
    // console.log(references.to || references.from)
    // dispatch(highlightSegment(segmentsToHighlight))
    // if (Array.isArray(references)) {
    //   dispatch(highlightSegmentEnd(references))
    // } else {
    // }
  }
  const onMouseLeave = () => {
    // dispatch(dehighlightSegment(segmentsToHighlight))
    // const { dispatch, references } = Entity.get(props.entityKey).getData()
    // if (Array.isArray(references)) {
    //   // dispatch(dehighlightSegmentEnd(references))
    // } else {
    //   // dispatch(dehighlightSegment(references))
    // }
  }

  return (
    <span onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter} onClick={() => (console.log(Entity.get(props.entityKey).getData()))} className='clickable' style={{ backgroundColor: '#42afe3', color: 'white', padding: '3px 5px 3px 5px', borderRadius: '3px' }} {...props}>{props.children}</span>
  )
}

const getEntityStrategy = (type) => {
  return (contentBlock, callback) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity()
        if (entityKey === null) {
          return false
        }
        return Entity.get(entityKey).getType() === type
      },
      callback
    )
  }
}

export default [
  {
    strategy: getEntityStrategy('Time'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('LocationFrom'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('LocationTo'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('Location'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('Tag'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('Semantic'),
    component: TimeSpan
  },
  {
    strategy: getEntityStrategy('Day'),
    component: TimeSpan
  }

]
