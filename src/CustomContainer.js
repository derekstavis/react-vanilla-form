import React from 'react'

const CustomContainer = () => {
  return (
    <div>
      <label htmlFor="name">Name</label>
      <input type="text" name="name" />
      <br />
      <label htmlFor="age">Age</label>
      <input type="number" name="age" />
    </div>
  )
}

module.exports = CustomContainer
