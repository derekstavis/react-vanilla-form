export function required (value) {
  return value ? false : 'This field is required!'
}

export function isNumber (value) {
  return parseInt(value) ? false : 'Should be a number'
}
