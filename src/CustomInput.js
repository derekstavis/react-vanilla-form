import React from 'react'

const Input = ({ name, type, onChange, title, value, error }) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input {...{ name, type, onChange, value }} />
    <label>{error}</label>
  </div>
)

Input.defaultProps = {
  type: 'text',
}

module.exports = Input
