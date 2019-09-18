## Usage

Difficult to explain with words, eh? Let's see it in practice. Install
`react-vanilla-form` package. The only component you need to import is
`Form`, which is the default package export:


```jsx static
import Form from 'react-vanilla-form'
```

## Serialization

Wire `onSubmit` prop from `Form` and store the result wherever you want
in state:

```jsx static
class FormState extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <React.Fragment>
        <Form onSubmit={data => this.setState({ data })}>
          {this.props.children}
        </Form>

        {this.state.result &&
          <pre><code>
            Result:<br />
            {JSON.stringify(this.state.result, null, 2)}
          </code></pre>
        }
      </React.Fragment>
    )
  }
}
```

Then proceed to place components inside the form:

```jsx
const FormState = require('./FormState.js');

<FormState>
  <label htmlFor="name">
    Name
  </label>
  <input type="text" name="name" />
  <br />
  <label htmlFor="age">
    Age
  </label>
  <input type="number" name="age" />
  <br />
  <label htmlFor="address">
    Address
  </label>
  <input type="text" name="address" />
  <br />
  <button>Submit!</button>
</FormState>
```

You can even nest objects infinite levels using the standard `fieldset` tag:

```jsx
const FormState = require('./FormState.js');

<FormState>
  <label htmlFor="name">
    Name:
  </label>
  <input type="text" name="name" />
  <br />
  <fieldset name="address">
    <legend>Address</legend>
    <label htmlFor="street">
      Street
    </label>
    <input type="text" name="street" />
    <br />
    <label htmlFor="number">
      House Number:
    </label>
    <input type="number" name="number" />
    <br />
    <label htmlFor="postal_code">
      Number
    </label>
    <input type="text" name="postal_code" />
  </fieldset>
  <button>Submit!</button>
</FormState>
```

## Use own components

It's also possible to use custom input components as long as they follow the
standard input interface:


```jsx static
const Input = ({ name, type, onChange, title }) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input {...{ name, type, value, onChange: e => onChange(e.target.value) }} />
  </div>
)

Input.defaultProps = {
  type: "text",
}
```

They should work as expected:

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

<FormState>
  <Input type="text" name="name" title="Full name" />
  <fieldset name="address">
    <legend>Address</legend>
    <Input type="text" name="street" title="Street" />
    <Input type="number" name="number" title="House Number" />
    <Input type="text" name="postal_code" title="Postal Code" />
  </fieldset>
  <button>Submit!</button>
</FormState>
```

## Validating data

Validation is triggered both on the fly (as the user types) and when the
form is submitted. It's achieved through `validation` prop in `Form`, which
accepts an object whose keys mirror form field structure, specifying the
validation function or function array.

The validation function receives the input value and in case of an error it
should return an string with the message to be displayed for the user,
otherwise return `false` (or a falsy value).

To capture error messages for an `input`, use a sibling `label` component
pointing to the `label` using `htmlFor` and define the `role` as `alert`.
When using a custom input, error messages will be passed through via
`error` prop. For customizing error properties, see more on next
sections.


```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

function required (value) {
  return value ? false : 'This field is required!'
}

function isNumber (value) {
  return parseInt(value) ? false : 'Should be a number'
}

<FormState validation={{
  name: required,
  address: {
    street: required,
    number: [required, isNumber],
  }
}}>
  <Input name="name" title="Full name" />
  <label htmlFor="name" role="alert" />
  <fieldset name="address">
    <legend>Address</legend>
    <Input name="street" title="Street" />
    <label htmlFor="street" role="alert" />
    <Input type="text" name="number" title="House Number" />
    <label htmlFor="number" role="alert" />
    <Input name="postal_code" title="Postal Code" />
    <label htmlFor="postal_code" role="alert" />
  </fieldset>
  <button>Submit!</button>
</FormState>
```

### Custom error properties

It is possible to receive the error message into the validated field via
props by configuring the error prop name with `customErrorProp` prop.

Let's say we want to improve the custom input component to include an
`errorMessage` prop:

```jsx static
const Input = ({ name, type, onChange, title, value, errorMessage }) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input {...{ name, type, onChange, value }} />
    <label>{errorMessage}</label>
  </div>
)
```

Configure `customErrorProp="errorMessage"` on the form with the prop name:

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

function required (value) {
  return value ? false : 'This field is required!'
}

<FormState
  validation={{ name: required }}
  customErrorProp="errorMessage"
>
  <Input name="name" title="Full name" />
  <button>Submit!</button>
</FormState>
```

Now the custom input will receive the validation error as a prop.

### Run validations on different events

By default, validations will run on `change` event, meaning that the
feedback will be realtime, which sometimes is the desired behaviour,
but sometimes might confuse users. For this cases, it's possible to
change the event which will triggered via `validateOn` prop. The
supported events are `change`, `focus`, `blur` and `submit`. Using
`submit` will effectively disable realtime validation.

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

function required (value) {
  return value ? false : 'This field is required!'
}

function isNumber (value) {
  return parseInt(value) ? false : 'Should be a number'
}

<FormState
  customErrorProp="errorMessage"
  validateOn="blur"
  validation={{
    name: required,
    address: {
      street: required,
      number: [required, isNumber],
    }
  }}
>
  <Input name="name" title="Full name" />
  <fieldset name="address">
    <Input name="street" title="Street" />
    <Input type="text" name="number" title="House Number" />
  </fieldset>
  <button>Submit!</button>
 </FormState>
```

### Keep validation errors on focus

By default, when an input has an error message and it's touched (focused),
the error message for the touched input will be cleared.

If you want to keep validations errors, specify `keepErrorOnFocus`:

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

function required (value) {
  return value ? false : 'This field is required!'
}

function isNumber (value) {
  return parseInt(value) ? false : 'Should be a number'
}

<FormState
  customErrorProp="errorMessage"
  validateOn="blur"
  keepErrorOnFocus
  validation={{
    name: required,
    address: {
      street: required,
      number: [required, isNumber],
    }
  }}
>
  <Input name="name" title="Full name" />
  <fieldset name="address">
    <Input name="street" title="Street" />
    <Input type="text" name="number" title="House Number" />
  </fieldset>
  <button>Submit!</button>
</FormState>

```

## Setting form data

It's possible to set the form data by passing an object whose keys mirror
form field's structure via `data` prop.

Currently the form keeps an internal state. When the `data` prop change
the internal state will be synced with the prop's value.

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

function required (value) {
  return value ? false : 'This field is required!'
}

function isNumber (value) {
  return parseInt(value) ? false : 'Should be a number'
}

<FormState
  data={{
    name: 'Obi Wan Kenobi',
    address: {
      street: 'A galaxy far far away',
      number: 'Never mind',
    }
  }}
  validation={{
    name: required,
    address: {
      street: required,
      number: [required, isNumber],
    }
  }}
>
  <Input name="name" title="Full name" />
  <fieldset name="address">
    <Input name="street" title="Street" />
    <Input type="text" name="number" title="House Number" />
    <label htmlFor="number" role="alert" />
  </fieldset>
  <button>Submit!</button>
 </FormState>
```

## Validating `data` prop

When setting form data via `data` prop, by default the data will not be
validated. Sometimes there are situations where you may want to validate
and display errors, e.g.: server-side rendering. To validate the
data set through `data` prop, set `validateDataProp` to true:

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

function required (value) {
  return value ? false : 'This field is required!'
}

function isNumber (value) {
  return parseInt(value) ? false : 'Should be a number'
}

<FormState
  data={{
    name: 'Obi Wan Kenobi',
    address: {
      street: 'A galaxy far far away',
      number: 'Never mind',
    }
  }}
  validation={{
    name: required,
    address: {
      street: required,
      number: [required, isNumber],
    }
  }}
  customErrorProp="errorMessage"
  validateDataProp
>
  <Input name="name" title="Full name" />
  <fieldset name="address">
    <Input name="street" title="Street" />
    <Input name="number" title="House Number" />
  </fieldset>
  <button>Submit!</button>
 </FormState>
```

## Setting errors manually

It is possible to overwrite form errors using `errors` prop. This is
useful for controlling your own validations on the parent component. 

> *Important*: in this case, you must control when the error is showed and cleared.

### Possible use cases: 

#### - async validations

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

class ParentComponent extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      errors: {
        email: 'email is required'
      },
      loading: false
    }

    this.inputTimeout = 0;
    this.onEmailChange = this.onEmailChange.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
  }

  onEmailChange(value) {
    if (this.inputTimeout) clearTimeout(this.inputTimeout)

    this.setState({ loading: true, errors: undefined })

    this.inputTimeout = setTimeout(() => {
      this.validateEmail(value)
    }, 500)
  }

  validateEmail(email) {
    const isValid = email === 'foo@example.com';
    const errors = isValid ? undefined : { email: 'email already exists' }

    this.setState({
      loading: false,
      errors
    })
  }

  render() {
    const { errors, loading } = this.state;

    return (
      <FormState
        customErrorProp="errorMessage"
        errors={errors}
      >
        <Input name="email" title="E-mail" onChange={this.onEmailChange} />
        <button disabled={loading}>{ loading ? 'Loading...' : 'Submit!' }</button>

        <p>In this example, only <strong>foo@example.com</strong> is a valid email</p>
      </FormState>
    )
  }
}

<ParentComponent />

```

#### - mixing custom errors with `this.props.validations`

Using `errors` prop do not block you from using `validations` prop. You can mix both of them to reduce boilerplate and achieve more complex validations.

> *Important*: `this.props.errors` messages have priority over `validations` ones.

In the example below, we validate both email existence and its length.

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

function required (value) {
  return value ? false : 'This field is required!'
}

function minEmailLength (value) {
  return value.length > 17 ? false : 'This email is too short' ;
}

class ParentComponent extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      errors: {
        email: undefined
      },
      loading: false
    }

    this.inputTimeout = 0;
    this.onEmailChange = this.onEmailChange.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
  }

  onEmailChange(value) {
    if (this.inputTimeout) clearTimeout(this.inputTimeout)

    this.setState({ loading: true, errors: undefined })

    this.inputTimeout = setTimeout(() => {
      this.validateEmail(value)
    }, 500)
  }

  validateEmail(email) {
    const isValid = ['foo@example.com', 'foobar@example.com'].includes(email)
    const errors = isValid ? undefined : { email: 'This email already exists' }

    this.setState({
      loading: false,
      errors
    })
  }

  render() {
    const { errors, loading } = this.state;

    return (
      <FormState
        customErrorProp="errorMessage"
        errors={errors}
        validateDataProp
        validation={{
          email: [required, minEmailLength]
        }}
      >
        <Input name="email" title="E-mail" onChange={this.onEmailChange} />
        <button disabled={loading}>{ loading ? 'Loading...' : 'Submit!' }</button>

        <p>First, try using "foo@example.com". Then, try "foobar@example.com".</p>
        <p>Both <strong>foo@example.com</strong> and <strong>foobar@example.com</strong> are available to use, but only the last matches our custom criteria (<code>email.length > 17 </code>)</p>
      </FormState>
    )
  }
}

<ParentComponent />

```

## Getting form data realtime

It's possible to get the form data updates realtime using `onChange` prop.
This can be useful if you want to render components conditionally based
on form state.

> *Important:* It's not required to retro-feed `data` prop.

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

function required (value) {
  return value ? false : 'This field is required!'
}

function isNumber (value) {
  return parseInt(value) ? false : 'Should be a number'
}

<FormState
  onChange={(data, setState) => setState({ data })}
  validateDataProp
  customErrorProp="errorMessage"
  data={{
    name: 'Obi Wan Kenobi',
    address: {
      street: 'A galaxy far far away',
      number: "xxx",
      state: "ny",
    },
    accepted: false,
  }}
  validation={{
    name: required,
    address: {
      street: required,
      number: [required, isNumber],
    }
  }}
>
  <Input name="name" title="Full name" />
  <label htmlFor="civil_state">
    Civil State
  </label>
  <input type="radio" name="civil_state" value="married" /> Married
  <input type="radio" name="civil_state" value="single" /> Single
  <fieldset name="address">
    <Input name="street" title="Street" />
    <Input name="number" title="House Number" />
    <label htmlFor="state">
      State
    </label>
    <select name="state">
      <option value="ca">California</option>
      <option value="ny">New York</option>
    </select>
  </fieldset>
  <label htmlFor="accept_terms">
    <input type="checkbox" name="accepted" />
    Accept the terms of service
  </label>
  <br />
  <button>Submit!</button>
 </FormState>
```

## Continue using `onChange`

You can continue using `onChange` for receiving change events on specific
inputs. This may be necessary if you want to check when the user has
changed a single input value without needing to subscribe to form's
`onChange` (and thus having to keep comparing previous/next values):

```jsx
const FormState = require('./FormState.js');
const Input = require('./CustomInput.js');

<FormState>
  <Input name="name" title="Full name" onChange={console.log} />
  <button>Submit!</button>
</FormState>
```
