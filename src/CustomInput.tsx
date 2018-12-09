import React from 'react'

const Input = ({
  errorMessage,
  name,
  onBlur,
  onChange,
  onFocus,
  title,
  type,
  value,
}) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input
      {...{
        name,
        onBlur,
        onChange: e => onChange(e.target.value),
        onFocus,
        type,
        value,
      }}
    />
    <small style={{ color: 'red' }}>{errorMessage}</small>
  </div>
)

Input.defaultProps = {
  type: 'text',
}

export default Input
