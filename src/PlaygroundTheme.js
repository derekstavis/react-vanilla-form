import React from 'react'
import ShadowDOM from 'react-shadow'
import milligram from 'milligram'
import marx from 'marx-css/css/marx.css'

const Themed = ({children}) =>
  <ShadowDOM include={[marx]}><div>{children}</div></ShadowDOM>

export default Themed
