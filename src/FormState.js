import React from 'react'
import Form from '.'

class FormState extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div>
        <Form
          customErrorProp={this.props.customErrorProp}
          data={this.props.data}
          errors={this.props.errors}
          validation={this.props.validation}
          onSubmit={(result, errors) => this.setState({ result, errors })}
          onChange={
            this.props.onChange
              ? result => this.setState({ result })
              : undefined
          }
        >
          {this.props.children}
        </Form>
        {this.state.result &&
          <pre><code>
            Result:<br />
            {JSON.stringify(this.state.result, null, 2)}
          </code></pre>
        }
        {this.state.errors &&
          <pre><code>
            Errors:<br />
            {JSON.stringify(this.state.errors, null, 2)}
          </code></pre>
        }
      </div>
    )
  }
}

FormState.defaultProps = {
  customErrorProp: undefined,
  data: undefined,
  errors: undefined,
  validation: undefined,
  onSubmit: undefined,
  onChange: undefined,
}

module.exports = FormState

