import React, { Component } from 'react'

import {
  func,
  node,
  object,
  oneOf,
  string,
} from 'prop-types'

import {
  anyPass,
  complement,
  contains,
  dissocPath,
  dropLast,
  equals,
  is,
  isEmpty,
  isNil,
  lensPath,
  merge,
  partial,
  partialRight,
  pathSatisfies,
  reduce,
  set,
  view,
} from 'ramda'

const isErrorEmpty = anyPass([isNil, isEmpty, complement(Boolean)])

const capitalize = str =>
  str && `${str[0].toUpperCase()}${str.slice(1)}`

const getValue = event => {
  if (event.target) {
    return contains(event.target.value, ['on', 'off'])
      ? event.target.checked
      : event.target.value
  }

  return event
}

const isCheckable = element =>
  element.props.type === 'radio' ||
  element.props.type === 'checkbox' ||
  typeof element.props.checked !== 'undefined' ||
  typeof (element.type.defaultProps || {}).checked !== 'undefined'

export default class Form extends Component {
  constructor (props) {
    super(props)

    this.state = {
      data: props.data || {},
      errors: props.errors || {},
    }

    this.cloneTree = this.cloneTree.bind(this)
    this.validateTree = this.validateTree.bind(this)
    this.validateElement = this.validateElement.bind(this)
    this.notifyChangeEvent = this.notifyChangeEvent.bind(this)
    this.handleEvent = this.handleEvent.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.mergeErrors = this.mergeErrors.bind(this)

    if (props.validateDataProp) {
      this.state.errors = this.validateTree(this.state.errors, this)
    }
  }

  mergeErrors (newErrors) {
    if (newErrors && !equals(newErrors, this.state.errors)) {
      this.setState({ errors: merge(this.state.errors, newErrors) })
    }
  }

  componentWillReceiveProps (nextProps) {
    const { data, errors: nextErrors } = nextProps

    if (data && !equals(data, this.props.data)) {
      this.setState({ data }, () => {
        if (this.props.validateDataProp) {
          const errors = this.validateTree(this.state.errors, this)

          if (nextErrors && !equals(errors, nextErrors)) {
            this.setState({ errors: merge(errors, nextErrors) })
            return
          }
          this.setState({ errors })
          return
        }
        this.mergeErrors(nextErrors)
      })
      return
    }

    this.mergeErrors(nextErrors)
  }

  notifyChangeEvent () {
    const { onChange } = this.props

    if (typeof onChange === 'function') {
      const { data, errors } = this.state
      onChange(data, errors)
    }
  }

  validateElement (path, data, errors) {
    const lens = lensPath(path)
    const validation = view(lens, this.props.validation)

    if (!validation) {
      return errors
    }

    const value = view(lens, data)

    if (is(Array, validation)) {
      for (let validate of validation) {
        const err = validate(value)

        if (!isErrorEmpty(err)) {
          return set(lens, err, errors)
        }
      }
    }

    else if (typeof validation === 'function') {
      const err = validation(value)

      if (!isErrorEmpty(err)) {
        return set(lens, err, errors)
      }
    }

    const parentPath = dropLast(1, path)

    if (parentPath.length > 0) {
      if (pathSatisfies(isErrorEmpty, parentPath, errors)) {
        return dissocPath(parentPath, errors)
      }
    }

    return dissocPath(path, errors)
  }

  handleEvent (eventName, path, originalHandler, event) {
    if (typeof originalHandler === 'function') {
      originalHandler(event)
    }

    if (event && event.defaultPrevented) {
      return
    }

    const { validateOn } = this.props

    let data = this.state.data
    let errors = this.state.errors

    if (eventName === 'change') {
      const lens = lensPath(path)
      const value = getValue(event)

      data = set(lens, value, this.state.data)
    }

    if (eventName === validateOn) {
      errors = this.validateElement(path, data, errors)
    }

    this.setState({ data, errors }, this.notifyChangeEvent)
  }

  cloneTree (element, index, parentPath = []) {
    if (!element || typeof element === 'string') {
      return element
    }

    const path = element.props.name
      ? [...parentPath, element.props.name]
      : parentPath

    if (element.type === 'fieldset') {
      return React.cloneElement(element, {}, React.Children.map(
        element.props.children,
        partialRight(this.cloneTree, [path])
      ))
    }

    if (element.props.role === 'alert' && element.props.htmlFor) {
      const lens = lensPath([...path, element.props.htmlFor])
      const errors = view(lens, this.state.errors)

      if (errors) {
        const children = is(Array, errors) ? errors[0] : errors
        return React.cloneElement(element, { children })
      }

      return element
    }

    if (element.props.name) {
      const lens = lensPath(path)

      const {
        validateOn,
        customErrorProp: errorProp = 'error',
      } = this.props

      let props = {}

      props.onChange = partial(
        this.handleEvent,
        ['change', path, element.props.onChange]
      )

      if (['blur', 'focus'].includes(validateOn)) {
        const eventProp = `on${capitalize(validateOn)}`

        props[eventProp] = partial(
          this.handleEvent,
          [validateOn, path, element.props[eventProp]]
        )
      }

      const value = view(lens, this.state.data)

      if (isCheckable(element)) {
        if (typeof value === 'boolean') {
          props.checked = value
        } else {
          props.checked = value === element.props.value
        }
      } else {
        props.value = value
      }

      const error = view(lens, this.state.errors)

      if (error) {
        props[errorProp] = error
      }

      return React.cloneElement(element, props)
    }

    if (element.props.children) {
      return React.cloneElement(element, {}, React.Children.map(
        element.props.children,
        partialRight(this.cloneTree, [path])
      ))
    }

    return element
  }

  validateTree (errors = {}, element, parentPath = []) {
    if (!element || typeof element === 'string') {
      return errors
    }

    const children = React.Children.toArray(element.props.children)
    const path = element.props.name
      ? [...parentPath, element.props.name]
      : parentPath

    if (element.type !== 'select' && children.length > 0) {
      const childErrors = reduce(
        partialRight(this.validateTree, [path]),
        errors,
        children
      )

      if (isErrorEmpty(childErrors)) {
        const parentPath = dropLast(1, path)

        if (parentPath.length === 0) {
          return {}
        }

        return dissocPath(parentPath, errors)
      }

      return childErrors
    }

    if (element.props.name) {
      return this.validateElement(path, this.state.data, errors)
    }

    return errors
  }

  handleSubmit (event) {
    event.preventDefault()

    const errors = this.validateTree({}, this)

    this.setState(
      { errors },
      () => isErrorEmpty(this.state.errors)
        ? this.props.onSubmit(this.state.data)
        : this.props.onSubmit(this.state.data, this.state.errors)
    )
  }

  render () {
    const { className } = this.props

    return (
      <form onSubmit={this.handleSubmit} className={className}>
        {React.Children.map(
          this.props.children,
          partialRight(this.cloneTree, [this, []])
        )}
      </form>
    )
  }
}

Form.propTypes = {
  /**
   * The children can contain any kind of component. Inputs with name
   * property will be tracked for changes using `onChange` callback.
   * Sibling labels with `role=alert` and `htmlFor` pointing to a validated
   * component will be used to present the error message.
  **/
  children: node,
  /**
   * The validation object whose keys mirror form field structure.
   * Values of this object can be either functions or a function array.
   * Validation functions receives the input string and should return
   * a string message on error and a falsy value otherwise.
  **/
  validation: object, // eslint-disable-line
  /**
  * The event where validation will be triggered. By default, field
  * validations runs on `change` event.
  **/
  validateOn: oneOf(['change', 'blur', 'focus']),
  /**
   * The form submit callback. Receives the serialized form as an object.
  **/
  onSubmit: func,
  /**
   * The form change callback. This callback runs on every form control's
   * `onChange`, right after validations. When this is defined, the form
   * behaves as a controlled component, and the user is responsible for
   * updating the form state via `data` prop.
  **/
  /**
   * @callback onChange
   * @param {object} data
   * @param {object} errors
  **/
  onChange: func,
  /**
   * The form data object whose keys mirror form field structure.
   * Setting this prop will set the form controls' values accordingly.
   * This can be used for rendering an initial state or to use the form
   * as a controlled component.
  **/
  data: object, // eslint-disable-line
  /**
   * A property name to inject the error message in the named field.
   * This is useful for input wrappers with builtin error label, commonly
   * found in UI libraries.
  **/
  customErrorProp: string,
  className: string,
}

Form.defaultProps = {
  children: undefined,
  className: '',
  customErrorProp: undefined,
  data: undefined,
  onChange: undefined,
  onSubmit: undefined,
  validateDataProp: false,
  validateOn: 'change',
  validation: {},
}
