import React, { Fragment } from 'react'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import {
  assocPath,
  dissocPath,
  merge,
} from 'ramda'

import Form from '.'

configure({ adapter: new Adapter() })

const required = value => !value && 'required'
const isNumber = value => !parseInt(value, 10) && 'isNumber'
const isTrue = value => !value && 'isTrue'

const trigger = (wrapper, event, query, value) => {
  const mockEvent = value !== undefined
    ? { target: { value } }
    : undefined

  wrapper.find(query)
    .simulate(event, mockEvent)
}

const change = (wrapper, query, value) =>
  trigger(wrapper, 'change', query, value)

const blur = (wrapper, query) =>
  trigger(wrapper, 'blur', query)

const focus = (wrapper, query) =>
  trigger(wrapper, 'focus', query)

const submit = (wrapper) => {
  wrapper.find('form').simulate('submit')
}

const getProp = (prop, wrapper, query) => {
  return wrapper.find(query).prop(prop)
}

const renderBaseInputs = () => (
  <Fragment>
    <label htmlFor="name">Name</label>
    <input name="name" />
    <label htmlFor="age">Age</label>
    <input name="age" type="number" />
    <fieldset name="address">
      <legend>Address</legend>
      <div>
        <label htmlFor="street">Street</label>
        <input name="street" />
        <label htmlFor="number">Number</label>
        <input name="number" />
      </div>
      <div>
        <label htmlFor="city">City</label>
        <input name="city" />
        <label htmlFor="state">State</label>
        <select name="state">
          <option value="ca">California</option>
          <option value="ny">New York</option>
        </select>
      </div>
      <label htmlFor="instructions">Instructions</label>
      <textarea name="instructions" />
    </fieldset>
    <input name="accepted_terms" type="checkbox" />
  </Fragment>
)

const assertPropsEquals = (prop, wrapper, source) => {
  expect(getProp(prop, wrapper, { name: 'name' })).toEqual(source.name)
  expect(getProp(prop, wrapper, { name: 'age' })).toEqual(source.age)
  expect(getProp(prop, wrapper, { name: 'street' })).toEqual(source.address.street)
  expect(getProp(prop, wrapper, { name: 'number' })).toEqual(source.address.number)
  expect(getProp(prop, wrapper, { name: 'city' })).toEqual(source.address.city)
  expect(getProp(prop, wrapper, { name: 'state' })).toEqual(source.address.state)
  expect(getProp(prop, wrapper, { name: 'instructions' })).toEqual(source.address.instructions)
  expect(getProp(prop === 'value' ? 'checked' : prop, wrapper, { name: 'accepted_terms' })).toEqual(source.accepted_terms)
}

const baseData = {
  name: 'John Appleseed',
  age: '18',
  address: {
    street: 'Infinite Loop',
    number: '1',
    city: 'Palo Alto',
    state: 'ca',
    instructions: 'Do not ring the bell',
  },
  accepted_terms: true,
}

const baseValidation = {
  name: required,
  age: [required, isNumber],
  address: {
    street: required,
    number: [required, isNumber],
    city: required,
    state: required,
  },
  accepted_terms: [required, isTrue],
}

const baseErrors = {
  name: 'required',
  age: 'required',
  address: {
    street: 'required',
    number: 'required',
    city: 'required',
    state: 'required',
  },
  accepted_terms: 'required',
}

describe('Form Serialization', () => {
  test('serializes input[type="text"]', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <input name="name" />
        <input name="age" />
      </Form>
    )

    change(wrapper, { name: 'name' }, baseData.name)
    change(wrapper, { name: 'age' }, baseData.age)

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith({
      name: baseData.name,
      age: baseData.age,
    })
  })

  test('serializes input[type="checkbox"]', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <input name="accepted_terms" type="checkbox" />
      </Form>
    )

    change(wrapper, { name: 'accepted_terms' }, true)
    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith({
      accepted_terms: true,
    })

    change(wrapper, { name: 'accepted_terms' }, false)
    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith({
      accepted_terms: false,
    })
  })

  test('serializes input[type="radio"]', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <input name="civil_state" value="married" type="radio" />
        <input name="civil_state" value="single" type="radio" />
      </Form>
    )

    change(wrapper, { value: 'married' }, 'married')
    change(wrapper, { value: 'single' }, 'single')

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith({
      civil_state: 'single',
    })
  })

  test('serializes select', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <select name="state">
          <option value="ca">California</option>
          <option value="ny">New York</option>
        </select>
      </Form>
    )

    change(wrapper, { name: 'state' }, 'ca')
    change(wrapper, { name: 'state' }, 'ny')

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith({
      state: 'ny',
    })
  })

  test('serializes textarea', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <textarea name="text" />
      </Form>
    )

    change(wrapper, { name: 'text' }, 'Lorem ipsum')

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith({
      text: 'Lorem ipsum',
    })
  })

  test('serializes custom input', () => {
    const onSubmit = jest.fn()

    const CustomInput = ({ name, value, onChange, error }) =>
      <div>
        <input value={value} onChange={e => onChange(e.target.value)} />
        <label>{error}</label>
      </div>

    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <CustomInput name="name" />
      </Form>
    )

    const onChange = wrapper.find(CustomInput).prop('onChange')
    onChange(baseData.name)

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith({
      name: baseData.name,
    })
  })
  test('serializes deep inputs', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit}>
        <div>
          {renderBaseInputs()}
        </div>
      </Form>
    )

    change(wrapper, { name: 'name' }, baseData.name)
    change(wrapper, { name: 'age' }, baseData.age)
    change(wrapper, { name: 'street' }, baseData.address.street)
    change(wrapper, { name: 'number' }, baseData.address.number)
    change(wrapper, { name: 'city' }, baseData.address.city)
    change(wrapper, { name: 'state' }, baseData.address.state)
    change(wrapper, { name: 'instructions' }, baseData.address.instructions)
    change(wrapper, { name: 'accepted_terms' }, baseData.accepted_terms)

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith(baseData)
  })

  test('serializes deep inputs on change', () => {
    const onSubmit = jest.fn()
    const onChange = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit} onChange={onChange}>
        {renderBaseInputs()}
      </Form>
    )

    let formData = {}

    change(wrapper, { name: 'name' }, baseData.name)

    formData.name = baseData.name
    expect(onChange).toHaveBeenCalledWith(formData, {})

    change(wrapper, { name: 'age' }, baseData.age)

    formData.age = baseData.age
    expect(onChange).toHaveBeenCalledWith(formData, {})

    formData.address = {}

    change(wrapper, { name: 'street' }, baseData.address.street)

    formData.address.street = baseData.address.street
    expect(onChange).toHaveBeenCalledWith(formData, {})

    change(wrapper, { name: 'number' }, baseData.address.number)

    formData.address.number = baseData.address.number
    expect(onChange).toHaveBeenCalledWith(formData, {})

    change(wrapper, { name: 'city' }, baseData.address.city)

    formData.address.city = baseData.address.city
    expect(onChange).toHaveBeenCalledWith(formData, {})

    change(wrapper, { name: 'state' }, baseData.address.state)

    formData.address.state = baseData.address.state
    expect(onChange).toHaveBeenCalledWith(formData, {})

    change(wrapper, { name: 'instructions' }, baseData.address.instructions)

    formData.address.instructions = baseData.address.instructions
    expect(onChange).toHaveBeenCalledWith(formData, {})

    change(wrapper, { name: 'accepted_terms' }, baseData.accepted_terms)

    formData.accepted_terms = baseData.accepted_terms
    expect(onChange).toHaveBeenCalledWith(formData, {})

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith(baseData)
  })

  test('continues calling original change handler', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form>
        <input name="name" onChange={onChange}/>
      </Form>
    )

    change(wrapper, { name: 'name' }, baseData.name)

    expect(onChange).toHaveBeenCalled()
  })
})

describe('Form Validation', () => {
  test('validates deeply all inputs on submit', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit} validation={baseValidation}>
        {renderBaseInputs()}
      </Form>
    )

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith({}, baseErrors)
  })

  test('validates only the changed input on change', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form onChange={onChange} validation={baseValidation}>
        {renderBaseInputs()}
      </Form>
    )

    change(wrapper, { name: 'age' }, baseData.name)

    expect(onChange).toHaveBeenCalledWith(
      { age: baseData.name },
      { age: 'isNumber' }
    )
  })

  test('does not validate the input when default is prevented', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form onChange={onChange} validation={baseValidation}>
        <input name="age" onChange={e => e.preventDefault()} />
      </Form>
    )

    change(wrapper, { name: 'age' }, baseData.name)

    expect(onChange).not.toHaveBeenCalled()
  })

  test('updates validation only on changed input on change', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form
        data={baseData}
        onChange={onChange}
        validation={baseValidation}>
        {renderBaseInputs()}
      </Form>
    )

    change(wrapper, { name: 'age' }, baseData.name)

    expect(onChange).toHaveBeenCalledWith(
      assocPath(['age'], baseData.name, baseData),
      { age: 'isNumber' }
    )

    change(wrapper, { name: 'age' }, baseData.age)

    expect(onChange).toHaveBeenLastCalledWith(
      assocPath(['age'], baseData.age, baseData),
      {}
    )
  })

  test('validates only the changed input on blur', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form
        onChange={onChange}
        validation={baseValidation}
        validateOn="blur"
      >
        {renderBaseInputs()}
      </Form>
    )

    change(wrapper, { name: 'age' }, baseData.name)

    expect(onChange).toHaveBeenCalledWith({ age: baseData.name }, {})

    blur(wrapper, { name: 'age' })

    expect(getProp('error', wrapper, { name: 'age' })).toEqual('isNumber')
  })

  test('validates only the changed input on focus', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form
        onChange={onChange}
        validation={baseValidation}
        validateOn="focus"
      >
        {renderBaseInputs()}
      </Form>
    )

    change(wrapper, { name: 'age' }, baseData.name)

    expect(onChange).toHaveBeenCalledWith({ age: baseData.name }, {})

    focus(wrapper, { name: 'age' })
    const error = wrapper.find('[name="age"]').prop('error')

    expect(error).toEqual('isNumber')
  })

  test('validates deeply only the changed input on change', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form onChange={onChange} validation={baseValidation}>
        {renderBaseInputs()}
      </Form>
    )

    change(wrapper, { name: 'number' }, baseData.name)

    expect(onChange).toHaveBeenCalledWith(
      { address: { number: baseData.name } },
      { address: { number: 'isNumber' } }
    )
  })

  test('displays the error on label with role alert and name', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form onSubmit={onSubmit} validation={baseValidation}>
        {renderBaseInputs()}
        <label role="alert" htmlFor="age" />
      </Form>
    )

    submit(wrapper)

    const selector = { role: 'alert', htmlFor: 'age' }
    const error = getProp('children', wrapper, selector)

    expect(error).toEqual(baseErrors.age)
  })

  test('overrides the error prop using customErrorProp', () => {
    const wrapper = mount(
      <Form
        customErrorProp="errorMessage"
        validation={baseValidation}
      >
        {renderBaseInputs()}
      </Form>
    )

    change(wrapper, { name: 'number' }, baseData.name)

    const error = getProp('customErrorProp', wrapper, { name: 'number' })

    expect(error).toEqual(baseErrors.number)
  })

  test('removes input error message on focus', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form
        onChange={onChange}
        data={{
          name: 'my name',
          age: '20',
        }}
        errors={{
          name: 'my name error',
          age: 'my age error',
        }}
      >
        <input name="name" />
        <input name="age" />
      </Form>
    )

    focus(wrapper, { name: 'name' })
    change(wrapper, { name: 'name' }, 'other name')

    const data = {name: 'other name', age: '20'}
    const errors = {age: 'my age error'}

    expect(onChange).toHaveBeenCalledWith(data, errors)
  })
})

describe('Data prop', () => {
  test('sets data deeply', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form
        data={baseData}
        onSubmit={onSubmit}
        validation={baseValidation}
      >
        {renderBaseInputs()}
      </Form>
    )

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith(baseData)
  })

  test('updates data deeply', () => {
    const wrapper = mount(
      <Form
        data={baseData}
        validation={baseValidation}
      >
        {renderBaseInputs()}
      </Form>
    )

    const data = assocPath(['address', 'street'], 'Xuxa', baseData)

    wrapper.setProps({ data })
    wrapper.update()

    assertPropsEquals('value', wrapper, data)
  })

  test('validates data deeply with validateDataProp', () => {
    const data = dissocPath(['address', 'street'], baseData)

    const wrapper = mount(
      <Form
        data={data}
        validation={baseValidation}
        validateDataProp
      >
        {renderBaseInputs()}
      </Form>
    )

    const streetError = wrapper.find('[name="street"]').prop('error')

    expect(streetError).toEqual('required')
  })

  test('validates updated data deeply with validateDataProp', () => {
    let wrapper = mount(
      <Form
        data={baseData}
        validation={baseValidation}
        validateDataProp
      >
        {renderBaseInputs()}
      </Form>
    )

    const data = assocPath(['address', 'street'], '', baseData)
    const errors = { address: { street: 'required' } }

    wrapper.setProps({ data })
    wrapper.update()

    assertPropsEquals('error', wrapper, errors)
  })

  test('does not validate data deeply without validateDataProp', () => {
    const data = dissocPath(['address', 'street'], baseData)

    const wrapper = mount(
      <Form
        data={data}
        validation={baseValidation}
      >
        {renderBaseInputs()}
      </Form>
    )

    const streetError = wrapper.find('[name="street"]').prop('error')

    expect(streetError).toEqual(undefined)
  })
})

describe('Errors prop', () => {
  test('sets errors deeply via prop', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form
        errors={baseErrors}
        onSubmit={onSubmit}
        validation={baseValidation}
      >
        {renderBaseInputs()}
      </Form>
    )

    assertPropsEquals('error', wrapper, baseErrors)
  })

  test('updates errors via prop', () => {
    const wrapper = mount(
      <Form
        errors={baseErrors}
        validation={baseValidation}
      >
        {renderBaseInputs()}
      </Form>
    )

    assertPropsEquals('error', wrapper, baseErrors)

    const errors = assocPath(['address', 'street'], 'Xuxa', baseErrors)

    wrapper.setProps({ errors })
    wrapper.update()

    assertPropsEquals('error', wrapper, errors)
  })

  test('merge errors via prop with state errors when passing data and error', () => {
    const wrapper = mount(
      <Form
        validation={baseValidation}
        validateDataProp
      >
        {renderBaseInputs()}
      </Form>
    )

    assertPropsEquals('error', wrapper, baseErrors)

    const errors = {
      name: 'must be another name'
    }

    wrapper.setProps({
      data: {
        name: '',
      },
      errors,
    })

    wrapper.update()

    assertPropsEquals('error', wrapper, merge(baseErrors, errors))
  })
})

describe('Own props', () => {
  test('pass native form props to inner form component', () => {
    const wrapper = mount(
      <Form
        className="Xuxa"
        noValidate
      />
    )

    expect(getProp('className', wrapper, 'form')).toEqual('Xuxa')
    expect(getProp('noValidate', wrapper, 'form')).toBeTruthy()
  })
})
