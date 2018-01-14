import React from 'react'

const Input = ({ name, type, onChange, title }) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input {...{ name, type, onChange }} />
  </div>
)

Input.defaultProps = {
  type: 'text',
}

module.exports = Input
