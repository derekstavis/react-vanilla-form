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
          validation={this.props.validation}
          onSubmit={result => this.setState({ result })}
        >
          {this.props.children}
        </Form>
        {this.state.result &&
          <pre><code>
            Result:<br />
            {JSON.stringify(this.state.result, null, 2)}
          </code></pre>
        }
      </div>
    )
  }
}

module.exports = FormState

