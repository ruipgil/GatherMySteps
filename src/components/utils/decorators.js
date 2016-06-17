import React from 'react'
import { Entity } from 'draft-js'

import {
  highlightSegment,
  dehighlightSegment
} from 'actions/ui'

const TimeSpan = (props) => {
  const onMouseEnter = () => {
    const { dispatch, segment } = Entity.get(props.entityKey).getData()
    dispatch(highlightSegment(segment.get('id')))
  }
  const onMouseLeave = () => {
    const { dispatch, segment } = Entity.get(props.entityKey).getData()
    dispatch(dehighlightSegment(segment.get('id')))
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
  }
]
