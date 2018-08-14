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
          {...this.props}
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
          <pre><code>
            result:<br />
            {JSON.stringify(this.state.data, null, 2)}
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
  validateDataProp: undefined,
  validateOn: undefined,
  validation: undefined,
  onSubmit: undefined,
  onChange: undefined,
}

module.exports = FormState

