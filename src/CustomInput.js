import React from 'react'

const Input = ({ name, type, onChange, title, value }) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input {...{ name, type, onChange, value }} />
  </div>
)

Input.defaultProps = {
  type: 'text',
}

module.exports = Input
