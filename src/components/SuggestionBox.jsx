import React from 'react'

const SuggestionBox = ({ left, top, selected, onSelect, suggestions, show }) => {
  const style = {
    border: '1px solid #ddd',
    minWidth: '180px',
    position: 'absolute',
    background: '#fff',
    borderRadius: '4px',
    boxShadow: '0px 4px 30px 0px rgba(220,220,220,1)',
    cursor: 'pointer',
    paddingTop: '2px',
    paddingLeft: '8px',
    paddingBottom: '2px',
    zIndex: 800,
    color: 'black',
    left: left + 'px',
    top: top + 'px',
    display: show ? 'block' : 'none'
  }

  return (
    <ul style={ style }>
      {
        suggestions.map((s, i) => {
          return <li key={i} onClick={() => onSelect(s)} style={{
            backgroundColor: (i === selected) ? 'yellow' : 'transparent'
          }}>{s}</li>
        })
      }
    </ul>
  )
}

export default SuggestionBox
