<img width="196px" align="left" hspace="20px" src="https://upload.wikimedia.org/wikipedia/commons/6/69/IceCreamSandwich.jpg" />

# React Vanilla Form
> An unobstrusibe form serializer and validator that works by following standards.

<br />

Vanilla Form is a form serialization and validation component built upon
standards. To obtain the serialized form state the only thing you need to
do is to declare your form controls (native or custom!) following the
standard input interfaces: Using `name`, `htmlFor` and `role` properties
and wiring `onSubmit` prop to `Form` component.

### Usage

Difficult to explain with words, eh? Let's see it in practive. Install
`react-vanilla-form` package. The only component you need to import is
`Form`, which is the default package export:


```jsx static
import Form from 'react-vanilla-form'
```

### Serialization

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
        <Form onSubmit={result => this.setState({ result })}>
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
const FormState = require('./src/FormState.js');

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
const FormState = require('./src/FormState.js');

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

### Use own components

It's also possible to use custom input components as long as they follow the
standard input interface:


```jsx static
const Input = ({ name, type, onChange, title }) => (
  <div>
    <label htmlFor={name}>{title}</label>
    <input {...{ name, type, onChange }} />
  </div>
)

Input.defaultProps = {
  type: "text",
}
```

They should work as expected:

```jsx
const FormState = require('./src/FormState.js');
const Input = require('./src/CustomInput.js');

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

### Validating data

Validation is triggered both on the fly (as the user types) and when the
form is submitted. It's achieved through `validation` prop in `Form`, which
accepts an object whose keys mirror form field structure, specifying the
validation function or function array.

The validation function receives the input value and in case of an error it
should return an string with the message to be displayed for the user,
otherwhise return `false` (or a falsy value).

To capture error messages for an `input`, use a sibling `label` component
pointing to the `label` using `htmlFor` and define the `role` as `alert`.

```jsx
const FormState = require('./src/FormState.js');
const Input = require('./src/CustomInput.js');

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
    <Input type="number" name="number" title="House Number" />
    <label htmlFor="number" role="alert" />
    <Input name="postal_code" title="Postal Code" />
    <label htmlFor="postal_code" role="alert" />
  </fieldset>
  <button>Submit!</button>
</FormState>
```

### Setting Initial Values

It's possible to set the initial values of the form by passing an object whose
keys mirror form field structure, specifying the initial value for the fields.

```jsx
const FormState = require('./src/FormState.js');
const Input = require('./src/CustomInput.js');

<Form initialValues={{
  name: 'Obi One Kenobi',
  address: {
    street: 'A galaxy far far away',
    number: 123,
  }
}}>
  <Input name="name" title="Full name" />
  <fieldset name="address">
    <Input name="street" title="Street" />
    <Input type="number" name="number" title="House Number" />
  </fieldset>
 </Form>
```
