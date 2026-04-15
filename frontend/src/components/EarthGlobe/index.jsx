import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Canvas } from '@tarojs/components'
import './index.css'

function EarthGlobe() {
  const [isLoading, setIsLoading] = useState(true)
  const canvasRef = useRef(null)

  useEffect(() => {
    // 模拟加载地球仪
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // 在H5端使用Three.js，在小程序端使用2D模拟
  const renderEarth = () => {
    if (process.env.TARO_ENV === 'h5') {
      return (
        <View className="earth-3d-container">
          <Image 
            src="https://example.com/earth-3d.gif" 
            className="earth-3d-image"
            mode="aspectFill"
          />
        </View>
      )
    } else {
      return (
        <View className="earth-2d-container">
          <Image 
            src="https://example.com/earth-2d.png" 
            className="earth-2d-image"
            mode="aspectFill"
          />
          <View className="earth-rotation"></View>
        </View>
      )
    }
  }

  return (
    <View className="earth-globe">
      {isLoading ? (
        <View className="loading-container">
          <Text className="loading-text">加载地球仪...</Text>
          <View className="loading-spinner"></View>
        </View>
      ) : (
        <>
          {renderEarth()}
          <View className="earth-info">
            <Text className="earth-title">中国文旅地球仪</Text>
            <Text className="earth-subtitle">探索中国自然奇观</Text>
          </View>
        </>
      )}
    </View>
  )
}

export default EarthGlobe
