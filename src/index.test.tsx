import { oc } from 'ts-optchain'
import { configure, mount, EnzymePropSelector, ReactWrapper } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import React, { Fragment, SFC } from 'react'

import { assocPath, dissocPath, merge } from 'ramda'

import Form, { FormErrors, FormValidation } from '.'

configure({ adapter: new Adapter() })

/* ---------------------------- enzyme helpers --------------------------- */
const trigger = (
  wrapper: ReactWrapper,
  event: string,
  query: EnzymePropSelector,
  value?: any
) => {
  const mockEvent = value !== undefined ? { target: { value } } : undefined

  wrapper.find(query).simulate(event, mockEvent)
}

const change = (wrapper: ReactWrapper, query: EnzymePropSelector, value: any) =>
  trigger(wrapper, 'change', query, value)

const blur = (wrapper: ReactWrapper, query: EnzymePropSelector) =>
  trigger(wrapper, 'blur', query)

const focus = (wrapper: ReactWrapper, query: EnzymePropSelector) =>
  trigger(wrapper, 'focus', query)

const submit = (wrapper: ReactWrapper) => {
  wrapper.find('form').simulate('submit')
}

const getProp = (
  prop: string,
  wrapper: ReactWrapper,
  query: EnzymePropSelector
) => {
  return wrapper.find(query).prop(prop)
}
/* -------------------------- end enzyme helpers ------------------------- */

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}

interface IMockFormData {
  name: string
  age: string
  address: {
    street: string
    number: string
    city: string
    state: string
    instructions: string
  }
  accepted_terms: boolean
}

const required = (value: any) => !value && 'required'
const isNumber = (value: any) => !parseInt(value, 10) && 'isNumber'
const isTrue = (value: any) => !value && 'isTrue'

const baseData: IMockFormData = {
  accepted_terms: true,
  address: {
    city: 'Palo Alto',
    instructions: 'Do not ring the bell',
    number: '1',
    state: 'ca',
    street: 'Infinite Loop',
  },
  age: '18',
  name: 'John Appleseed',
}

const baseValidation: FormValidation<IMockFormData> = {
  accepted_terms: [required, isTrue],
  address: {
    city: required,
    number: [required, isNumber],
    state: required,
    street: required,
  },
  age: [required, isNumber],
  name: required,
}

const baseErrors: FormErrors<IMockFormData> = {
  accepted_terms: 'required',
  address: {
    city: 'required',
    number: 'required',
    state: 'required',
    street: 'required',
  },
  age: 'required',
  name: 'required',
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

const assertPropsEquals = (
  prop: string,
  wrapper: ReactWrapper,
  source: IMockFormData | FormErrors<IMockFormData>
) => {
  expect(getProp(prop, wrapper, { name: 'name' })).toEqual(source.name)
  expect(getProp(prop, wrapper, { name: 'age' })).toEqual(source.age)
  expect(getProp(prop, wrapper, { name: 'street' })).toEqual(
    oc(source).address.street
  )
  expect(getProp(prop, wrapper, { name: 'number' })).toEqual(
    oc(source).address.number
  )
  expect(getProp(prop, wrapper, { name: 'city' })).toEqual(
    oc(source).address.city
  )
  expect(getProp(prop, wrapper, { name: 'state' })).toEqual(
    oc(source).address.state
  )
  expect(getProp(prop, wrapper, { name: 'instructions' })).toEqual(
    oc(source).address.instructions
  )
  expect(
    getProp(prop === 'value' ? 'checked' : prop, wrapper, {
      name: 'accepted_terms',
    })
  ).toEqual(source.accepted_terms)
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
      age: baseData.age,
      name: baseData.name,
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

    interface IProps {
      error?: string
      name: string
      onChange?: (value: string) => void
      value?: string
    }

    const CustomInput: SFC<IProps> = ({
      name,
      value,
      onChange,
      error,
    }: IProps) => (
      <div>
        <input
          name={name}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
        <label>{error}</label>
      </div>
    )

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
        <div>{renderBaseInputs()}</div>
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

    const formData: RecursivePartial<IMockFormData> = {}

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
        <input name="name" onChange={onChange} />
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
        <input name="age" onChange={(e) => e.preventDefault()} />
      </Form>
    )

    change(wrapper, { name: 'age' }, baseData.name)

    expect(onChange).not.toHaveBeenCalled()
  })

  test('updates validation only on changed input on change', () => {
    const onChange = jest.fn()

    const wrapper = mount(
      <Form data={baseData} onChange={onChange} validation={baseValidation}>
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
      <Form onChange={onChange} validation={baseValidation} validateOn="blur">
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
      <Form onChange={onChange} validation={baseValidation} validateOn="focus">
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
      <Form customErrorProp="errorMessage" validation={baseValidation}>
        {renderBaseInputs()}
      </Form>
    )

    change(wrapper, { name: 'number' }, baseData.name)

    const error = getProp('customErrorProp', wrapper, { name: 'number' })

    expect(error).toEqual(baseErrors.address && baseErrors.address.number)
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

    const data = { name: 'other name', age: '20' }
    const errors = { age: 'my age error' }

    expect(onChange).toHaveBeenCalledWith(data, errors)
  })
})

describe('Data prop', () => {
  test('sets data deeply', () => {
    const onSubmit = jest.fn()

    const wrapper = mount(
      <Form data={baseData} onSubmit={onSubmit} validation={baseValidation}>
        {renderBaseInputs()}
      </Form>
    )

    submit(wrapper)

    expect(onSubmit).toHaveBeenCalledWith(baseData)
  })

  test('updates data deeply', () => {
    const wrapper = mount(
      <Form data={baseData} validation={baseValidation}>
        {renderBaseInputs()}
      </Form>
    )

    const data = assocPath(['address', 'street'], 'Xuxa', baseData)

    wrapper.setProps({ data })
    wrapper.update()

    assertPropsEquals('value', wrapper, data)
  })

  test('validates data deeply with validateDataProp', () => {
    const data: IMockFormData = dissocPath(['address', 'street'], baseData)

    const wrapper = mount(
      <Form data={data} validation={baseValidation} validateDataProp={true}>
        {renderBaseInputs()}
      </Form>
    )

    const streetError = wrapper.find('[name="street"]').prop('error')

    expect(streetError).toEqual('required')
  })

  test('validates updated data deeply with validateDataProp', () => {
    const wrapper = mount(
      <Form data={baseData} validation={baseValidation} validateDataProp={true}>
        {renderBaseInputs()}
      </Form>
    )

    const data: IMockFormData = assocPath(['address', 'street'], '', baseData)
    const errors: FormErrors<IMockFormData> = {
      address: { street: 'required' },
    }

    wrapper.setProps({ data })
    wrapper.update()

    assertPropsEquals('error', wrapper, errors)
  })

  test('does not validate data deeply without validateDataProp', () => {
    const data: IMockFormData = dissocPath(['address', 'street'], baseData)

    const wrapper = mount(
      <Form data={data} validation={baseValidation}>
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
      <Form errors={baseErrors} onSubmit={onSubmit} validation={baseValidation}>
        {renderBaseInputs()}
      </Form>
    )

    assertPropsEquals('error', wrapper, baseErrors)
  })

  test('updates errors via prop', () => {
    const wrapper = mount(
      <Form errors={baseErrors} validation={baseValidation}>
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
      <Form validation={baseValidation} validateDataProp={true}>
        {renderBaseInputs()}
      </Form>
    )

    assertPropsEquals('error', wrapper, baseErrors)

    const errors = {
      name: 'must be another name',
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
