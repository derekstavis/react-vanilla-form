import React from 'react'
import Form from '.'
import Themed from './PlaygroundTheme'

class FormState extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <Themed>
        <Form
          customErrorProp={this.props.customErrorProp}
          data={this.props.data}
          errors={this.props.errors}
          validateDataProp={this.props.validateDataProp}
          validateOn={this.props.validateOn}
          validation={this.props.validation}
          keepErrorOnFocus={this.props.keepErrorOnFocus}
          onSubmit={(data, errors) =>
            this.setState({ data, errors })
          }
          onChange={(data, errors) => {
            if (!this.props.onChange) return
            this.setState({ data, errors })
          }}
        >
          {this.props.children}
        </Form>
        {this.state.data &&
          <React.Fragment>
            <h4>Data:</h4>
            <pre>
              <code>
                {JSON.stringify(this.state.data, null, 2)}
              </code>
            </pre>
          </React.Fragment>
        }
        {this.state.errors &&
          <React.Fragment>
            <h4>Errors:</h4>
            <pre>
              <code>
                {JSON.stringify(this.state.errors, null, 2)}
              </code>
            </pre>
          </React.Fragment>
        }
      </Themed>
    )
  }
}

FormState.defaultProps = {
  customErrorProp: undefined,
  data: undefined,
  errors: undefined,
  validateDataProp: undefined,
  validateOn: undefined,
  validation: undefined,
  keepErrorOnFocus: undefined,
  onSubmit: undefined,
  onChange: undefined,
}

export default FormState

