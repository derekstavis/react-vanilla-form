import React, { FocusEventHandler, SFC } from 'react'

interface IInputProps {
  errorMessage?: string
  name?: string
  onBlur?: FocusEventHandler
  onChange?: (value: string) => void
  onFocus?: FocusEventHandler
  title?: string
  type?: string
  value?: string
}

const Input: SFC<IInputProps> = ({
  errorMessage,
  name,
  onBlur,
  onChange,
  onFocus,
  title,
  type = 'text',
  value,
}) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input
      {...{
        name,
        onBlur,
        onChange: (e) => onChange && onChange(e.target.value),
        onFocus,
        type,
        value,
      }}
    />
    <small style={{ color: 'red' }}>{errorMessage}</small>
  </div>
)

export default Input
