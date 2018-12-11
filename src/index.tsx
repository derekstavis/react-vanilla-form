import React, {
  ChangeEvent,
  ChangeEventHandler,
  Component,
  FormEvent,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react'

import { bool, func, node, object, oneOf, string } from 'prop-types'

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
  pathSatisfies,
  reduce,
  set,
  view,
} from 'ramda'

const isErrorEmpty = anyPass([isNil, isEmpty, complement(Boolean)])

const getValue = (event: ChangeEvent<HTMLInputElement> | any): any => {
  if (event.target) {
    return contains(event.target.value, ['on', 'off'])
      ? event.target.checked
      : event.target.value
  }

  return event
}

type NativeInputElement = ReactElement<HTMLInputElement>
type CustomInputElement = ReactElement<{}>

const isCheckable = (element: NativeInputElement | CustomInputElement) =>
  (element as NativeInputElement).props.type === 'radio' ||
  (element as NativeInputElement).props.type === 'checkbox' ||
  typeof (element as NativeInputElement).props.checked !== 'undefined'

export type FormErrors<Data extends {}> = {
  [Key in keyof Data]?: Data[Key] extends object
    ? FormErrors<Data[Key]>
    : string
}

export type FormValidation<Data extends {}> = {
  [Key in keyof Data]?: Data[Key] extends object
    ? FormValidation<Data[Key]>
    :
        | Array<((value: Data[Key]) => string | null | false)>
        | ((value: Data[Key]) => string | null | false)
}

export interface IFormProps<Data extends {}> {
  children?: ReactNode
  className?: string
  customErrorProp?: 'error' | string
  data?: Data
  errors?: FormErrors<Data>
  keepErrorOnFocus?: boolean
  onChange?: (data: Data, errors?: FormErrors<Data>) => void
  onSubmit?: (data: Data, errors?: FormErrors<Data>) => void
  validateDataProp?: boolean
  validateOn?: 'change' | 'blur' | 'focus'
  validation?: FormValidation<Data>
}

interface IFormState<Data extends {}> {
  data: Data
  errors: FormErrors<Data>
}

type FormElementProps<Value> = {
  name: string
  onChange?: ChangeEventHandler | ((value: Value) => void)
  value?: Value
  error?: string
} & InputHTMLAttributes<HTMLInputElement>

type FormChildElement<Value> = ReactElement<FormElementProps<Value>>

// eslint-disable-next-line react/no-deprecated
export default class Form<Data extends {}> extends Component<
  IFormProps<Data>,
  IFormState<Data>
> {
  public static propTypes = {
    /**
     * The children can contain any kind of component. Inputs with name
     * property will be tracked for changes using `onChange` callback.
     * Sibling labels with `role=alert` and `htmlFor` pointing to a validated
     * component will be used to present the error message.
     */
    children: node,
    className: string,
    /**
     * A property name to inject the error message in the named field.
     * This is useful for input wrappers with builtin error label, commonly
     * found in UI libraries.
     */
    customErrorProp: string,
    /**
     * The form data object whose keys mirror form field structure.
     * Setting this prop will set the form controls' values accordingly.
     * This can be used for rendering an initial state or to use the form
     * as a controlled component.
     */
    data: object, // eslint-disable-line
    /**
     * Toggles if error messages should be kept after the input receives focus.
     * Not applicable if `validateOn` is set to `focus`.
     */
    keepErrorOnFocus: bool,
    /**
     * The form change callback. This callback runs on every form control's
     * `onChange`, right after validations. When this is defined, the form
     * behaves as a controlled component, and the user is responsible for
     * updating the form state via `data` prop.
     */
    /**
     * @callback onChange
     * @param {object} data
     * @param {object} errors
     */
    onChange: func,
    /**
     * The form submit callback. Receives the serialized form as an object.
     */
    onSubmit: func,
    /**
     * The event where validation will be triggered. By default, field
     * validations runs on `change` event.
     */
    validateOn: oneOf(['change', 'blur', 'focus']),
    /**
     * The validation object whose keys mirror form field structure.
     * Values of this object can be either functions or a function array.
     * FormValidation functions receives the input string and should return
     * a string message on error and a falsy value otherwise.
     */
    validation: object, // eslint-disable-line
  }

  public static defaultProps = {
    children: undefined,
    className: '',
    customErrorProp: undefined,
    data: undefined,
    keepErrorOnFocus: false,
    onChange: undefined,
    onSubmit: undefined,
    validateDataProp: false,
    validateOn: 'change',
    validation: {},
  }

  public state: IFormState<Data>

  constructor(props: IFormProps<Data>) {
    super(props)

    this.state = {
      data: props.data || (new Object() as Data),
      errors: props.errors || (new Object() as Data),
    }

    if (props.validateDataProp) {
      this.state.errors = this.validateTree(props.errors, this)
    }
  }

  public render() {
    const { className } = this.props

    return (
      <form onSubmit={this.handleSubmit} className={className}>
        {React.Children.map(this.props.children, (child) =>
          this.cloneTree(child)
        )}
      </form>
    )
  }

  public componentWillReceiveProps(nextProps: IFormProps<Data>) {
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

  private mergeErrors = (newErrors?: FormErrors<Data>) => {
    if (newErrors && !equals(newErrors, this.state.errors)) {
      this.setState({ errors: merge(this.state.errors, newErrors) })
    }
  }

  private notifyChangeEvent = () => {
    const { onChange } = this.props

    if (typeof onChange === 'function') {
      const { data, errors } = this.state
      onChange(data, errors)
    }
  }

  private validateElement = (
    path: string[],
    data: Data,
    errors: FormErrors<Data>
  ) => {
    const lens = lensPath(path)
    const validation = view(lens, this.props.validation)

    if (!validation) {
      return errors
    }

    const value = view(lens, data)

    if (Array.isArray(validation)) {
      for (const validate of validation) {
        const err = validate(value)

        if (!isErrorEmpty(err)) {
          return set(lens, err, errors)
        }
      }
    } else if (typeof validation === 'function') {
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

  private handleEvent = (
    eventName: 'change' | 'blur' | 'removeError',
    path: string[],
    originalHandler: ChangeEventHandler,
    event: ChangeEvent
  ) => {
    if (typeof originalHandler === 'function') {
      originalHandler(event)
    }

    if (event && event.defaultPrevented) {
      return
    }

    const { validateOn } = this.props

    let data = this.state.data
    let errors = this.state.errors
    const lens = lensPath(path)

    if (eventName === 'change') {
      const value = getValue(event)
      data = set(lens, value, this.state.data)
    }

    if (eventName === validateOn) {
      errors = this.validateElement(path, data, errors)
    }

    if (eventName === 'removeError') {
      errors = dissocPath(path, this.state.errors)
      this.setState({ data, errors })
      return
    }

    this.setState({ data, errors }, this.notifyChangeEvent)
  }

  private cloneTree = (
    element: FormChildElement<any> | any,
    parentPath: string[] = []
  ): ReactNode => {
    if (
      element === null ||
      element === undefined ||
      typeof element === 'string' ||
      typeof element === 'number' ||
      typeof element === 'boolean' ||
      element.type instanceof Component
    ) {
      return element
    }

    if (typeof element.props !== 'undefined') {
      return element
    }

    const path = element.props.name
      ? [...parentPath, element.props.name]
      : parentPath

    if (element.type === 'fieldset') {
      return React.cloneElement(
        element,
        {},
        React.Children.map(element.props.children, (child) =>
          this.cloneTree(child, path)
        )
      )
    }

    if (element.props.role === 'alert' && element.props.htmlFor) {
      const lens = lensPath([...path, element.props.htmlFor])
      const errors = view(lens, this.state.errors)

      if (errors) {
        const children =
          errors instanceof Array && errors.length > 0 ? errors[0] : errors
        return React.cloneElement(element, { children })
      }

      return element
    }

    if (element.props.name) {
      const lens = lensPath(path)

      const {
        validateOn,
        customErrorProp: errorProp = 'error',
        keepErrorOnFocus,
      } = this.props

      const props: Partial<FormElementProps<any>> = {}

      props.onChange = partial(this.handleEvent, [
        'change',
        path,
        element.props.onChange,
      ])

      if (validateOn === 'blur') {
        props.onBlur = partial(this.handleEvent, [
          validateOn,
          path,
          element.props.onBlur,
        ])
      }

      if (validateOn === 'focus') {
        props.onFocus = partial(this.handleEvent, [
          validateOn,
          path,
          element.props.onFocus,
        ])
      }

      if (validateOn !== 'focus' && !keepErrorOnFocus) {
        props.onFocus = partial(this.handleEvent, [
          'removeError',
          path,
          element.props.onFocus,
        ])
      }

      const value = view(lens, this.state.data)

      if (isCheckable(element)) {
        props.checked =
          typeof value === 'boolean' ? value : value === element.props.value
      } else {
        props.value = value
      }

      const error = view(lens, this.state.errors)

      if (error) {
        const unsafeAssigned = props as any
        unsafeAssigned[errorProp] = error
      }

      return React.cloneElement(element, props)
    }

    if (element.props.children) {
      return React.cloneElement(
        element,
        {},
        React.Children.map(element.props.children, (child) =>
          this.cloneTree(child, path)
        )
      )
    }

    return element
  }

  private validateTree = (
    errors: FormErrors<Data> = {},
    element: FormChildElement<any> | any,
    parentPath: string[] = []
  ): FormErrors<Data> => {
    if (!element || typeof element === 'string') {
      return errors
    }

    const children = React.Children.toArray(element.props.children)
    const path = element.props.name
      ? [...parentPath, element.props.name]
      : parentPath

    if (element.type !== 'select' && children.length > 0) {
      const childErrors = reduce(
        (acc, item) => this.validateTree(acc, item, path),
        errors,
        children
      )

      if (isErrorEmpty(childErrors)) {
        const saferParentPath = dropLast(1, path)

        if (saferParentPath.length === 0) {
          return {}
        }

        return dissocPath(saferParentPath, errors)
      }

      return childErrors
    }

    if (element.props.name) {
      return this.validateElement(path, this.state.data, errors)
    }

    return errors
  }

  private handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const errors = this.validateTree({}, this)

    this.setState({ errors }, () => {
      if (typeof this.props.onSubmit !== 'function') {
        return
      }

      isErrorEmpty(this.state.errors)
        ? this.props.onSubmit(this.state.data)
        : this.props.onSubmit(this.state.data, this.state.errors)
    })
  }
}
