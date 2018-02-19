import React from 'react'

const Input = ({ name, type, onChange, title, value, errorMessage }) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input {...{ name, type, value, onChange: e => onChange(e.target.value) }} />
    <label>{errorMessage}</label>
  </div>
)

Input.defaultProps = {
  type: 'text',
}

module.exports = Input
