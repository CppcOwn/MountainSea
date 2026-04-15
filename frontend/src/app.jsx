import React, { useState, useEffect } from 'react'
import { Component } from 'react'
import { Provider } from '@tarojs/taro'
import './app.css'

function App({ children }) {
  return (
    <Provider>
      {children}
    </Provider>
  )
}

export default App
