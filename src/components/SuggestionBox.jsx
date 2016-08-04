import React from 'react'

const SuggestionBox = ({ left, top, selected, onSelect, suggestions, show }) => {
  const style = {
    border: '1px solid #ddd',
    minWidth: '180px',
    position: 'fixed',
    background: '#fff',
    borderRadius: '4px',
    boxShadow: '0px 7px 25px -4px rgba(220,220,220,1)',
    cursor: 'pointer',
    paddingTop: '2px',
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
          return <li key={i} onMouseDown={(e) => e.preventDefault()} onMouseUp={() => onSelect(s)} style={{
            paddingLeft: '8px',
            backgroundColor: (i === selected) ? '#EAEAEA' : 'transparent'
          }}>{s}</li>
        })
      }
    </ul>
  )
}

export default SuggestionBox
