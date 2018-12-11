import React, { Component } from 'react'
import Form, { FormErrors, IFormProps } from '.'

interface IFormState<Data extends object> {
  data?: Data
  errors?: FormErrors<Data>
}

class FormState<Data extends object> extends Component<
  IFormProps<Data>,
  IFormState<Data>
> {
  constructor(props: IFormProps<Data>) {
    super(props)
    this.state = {}
  }

  public render() {
    return (
      <div>
        <Form
          customErrorProp={this.props.customErrorProp}
          data={this.props.data}
          errors={this.props.errors}
          validateDataProp={this.props.validateDataProp}
          validateOn={this.props.validateOn}
          validation={this.props.validation}
          keepErrorOnFocus={this.props.keepErrorOnFocus}
          onSubmit={this.handleSubmit}
          onChange={this.handleChange}
        >
          {this.props.children}
        </Form>
        {this.state.data && (
          <pre>
            <code>
              result:
              <br />
              {JSON.stringify(this.state.data, null, 2)}
            </code>
          </pre>
        )}
        {this.state.errors && (
          <pre>
            <code>
              Errors:
              <br />
              {JSON.stringify(this.state.errors, null, 2)}
            </code>
          </pre>
        )}
      </div>
    )
  }

  private handleChange = (data: Data, errors?: FormErrors<Data>) => {
    this.setState({ data, errors })
    if (this.props.onChange) {
      this.props.onChange(data, errors)
    }
  }

  private handleSubmit = (data: Data, errors?: FormErrors<Data>) => {
    this.setState({ data, errors })
    if (this.props.onSubmit) {
      this.props.onSubmit(data, errors)
    }
  }
}

export default FormState
