<img width="196px" align="left" hspace="20px" src="https://upload.wikimedia.org/wikipedia/commons/6/69/IceCreamSandwich.jpg" />

# React Vanilla Form
> An unobtrusive form serializer and validator that works by following standards.

<br />

Vanilla Form is a form serialization and validation component built upon
standards. To obtain the serialized form data the only thing you need to
do is to declare your form controls (native or custom!) following the
standard input interfaces: Using `name`, `value`, `htmlFor` and `role`
properties.

Wire `onSubmit` prop to `Form` component to get the serialized data from
the form. Pass `validations` to display and catch errors in the form.
Use `onChange` (or not) to get realtime data updates.

```
import Form from 'react-vanilla-form'

<Form onSubmit={data => console.log(data)}>
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
</Form>
```

Also, Vanilla Form is lightweight. It weighs only 2.7k gzipped. The only
direct depedencies are 4 or 5 Ramda functions which you can treeshake on
your bundler to slim it up (but you should consider using Ramda :smiley:).

See the full documentation and live examples at
http://derek.github.stavis.me/react-vanilla-form.
