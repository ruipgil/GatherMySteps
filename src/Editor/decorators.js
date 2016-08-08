import React from 'react'
import { Set } from 'immutable'
import { Entity } from 'draft-js'

import {
  highlightSegment,
  dehighlightSegment,
  highlightPoint,
  dehighlightPoint
} from 'actions/ui'

const SOLARIZED = {
  YELLOW: '#b58900',
  ORANGE: '#cb4b16',
  RED: '#dc322f',
  MAGENTA: '#d33682',
  VIOLET: '#6c71c4',
  BLUE: '#268bd2',
  CYAN: '#2aa198',
  GREEN: '#859900',
  L15: '#002b36',
  L20: '#073642',
  L45: '#586e75',
  L50: '#657b83',
  L60: '#839496',
  L65: '#93a1a1',
  L92: '#eee8d5',
  L97: '#fdf6e3'
}

const STYLES = {
  '_': {
    // backgroundColor: '#f7f8f9',
    padding: '1px 2px 1px 2px',
    borderRadius: '4px',
    fontWeight: 'bold',
    borderBottom: '1px solid #f0f1f2'
  },
  'Time': {
    color: SOLARIZED.GREEN
  },
  'Comment': {
    color: 'rgba(128, 128, 128, 0.4)',
    border: 0
  },
  'LocationFrom': {
    color: SOLARIZED.CYAN
  },
  'Location': {
    color: SOLARIZED.BLUE
  },
  'Timezone': {
    color: SOLARIZED.L65
  },
  'Day': {
    color: SOLARIZED.L50
  },
  'Tag': {
    color: SOLARIZED.YELLOW
  },
  'Semantic': {
    color: SOLARIZED.YELLOW
  }
}

const extractReferences = (references) => {
  let points = []
  let segments = []
  references = references || {}
  if (references.point) {
    points = [references.point]
    segments = [references.segmentId]
  } else {
    const { from, to } = references
    if (from) {
      points.push(from.point)
      segments.push(from.segmentId)
    }
    if (to) {
      points.push(to.point)
      segments.push(to.segmentId)
    }
  }

  return {
    points,
    segments: Set(segments).toJS()
  }
}

const Reference = (props) => {
  const { dispatch, references } = Entity.get(props.entityKey).getData()
  const { segments, points } = extractReferences(references)
  const onMouseEnter = () => {
    if (segments.length > 0) {
      dispatch(highlightSegment(segments))
    }
    if (points.length > 0) {
      dispatch(highlightPoint(points))
    }
  }
  const onMouseLeave = () => {
    if (segments.length > 0) {
      dispatch(dehighlightSegment(segments))
    }
    if (points.length > 0) {
      dispatch(dehighlightPoint(points))
    }
  }

  const type = Entity.get(props.entityKey).getType()
  const typeStyles = STYLES[type] ? STYLES[type] : {}
  const style = { ...STYLES._, ...typeStyles }

  return (
    <a onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter} style={style} {...props}>{props.children}</a>
  )
}

const TokenSpan = (props) => {
  const type = Entity.get(props.entityKey).getType()
  const typeStyles = STYLES[type] ? STYLES[type] : {}
  const style = { ...STYLES._, ...typeStyles }

  return (
    <span style={style} {...props}>{props.children}</span>
  )
}

const TimeSpan = (props) => {
  const type = Entity.get(props.entityKey).getType()
  const typeStyles = STYLES[type] ? STYLES[type] : {}
  const style = { ...STYLES._, ...typeStyles }

  const { timezone } = Entity.get(props.entityKey).getData()

  return (
    <span onMouseEnter={() => console.log(timezone)} style={style} {...props}>{props.children}</span>
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
    component: Reference
  },
  {
    strategy: getEntityStrategy('LocationTo'),
    component: Reference
  },
  {
    strategy: getEntityStrategy('Location'),
    component: Reference
  },
  {
    strategy: getEntityStrategy('Tag'),
    component: Reference
  },
  {
    strategy: getEntityStrategy('Semantic'),
    component: Reference
  },
  {
    strategy: getEntityStrategy('Day'),
    component: TokenSpan
  },
  {
    strategy: getEntityStrategy('Comment'),
    component: TokenSpan
  },
  {
    strategy: getEntityStrategy('Timezone'),
    component: TokenSpan
  }
]
