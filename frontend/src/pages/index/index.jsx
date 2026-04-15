import React, { useState, useEffect } from 'react'
import { View, Text, Swiper, SwiperItem, Image, ScrollView, TouchableOpacity } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import EarthGlobe from '../../components/EarthGlobe'
import { cacheRequest } from '../../utils/cache'
import './index.css'

function Index() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('earth')
  const [scenicSpots, setScenicSpots] = useState([])

  // 模拟景区数据，使用缓存优化性能
  useEffect(() => {
    const fetchScenicSpots = async () => {
      const data = await cacheRequest('scenic_spots', () => {
        return [
          {
            id: 1,
            name: '黄山',
            image: 'https://example.com/huangshan.jpg',
            description: '黄山是中国著名的山岳风景区，以奇松、怪石、云海、温泉、冬雪"五绝"著称于世。',
            wonders: ['云海', '日出', '雪景']
          },
          {
            id: 2,
            name: '九寨沟',
            image: 'https://example.com/jiuzhaigou.jpg',
            description: '九寨沟以翠海、叠瀑、彩林、雪峰、藏情、蓝冰"六绝"著称于世。',
            wonders: ['彩林', '蓝冰', '瀑布']
          },
          {
            id: 3,
            name: '峨眉山',
            image: 'https://example.com/emeishan.jpg',
            description: '峨眉山是中国四大佛教名山之一，以"雄、秀、神、奇、灵"和深厚的佛教文化著称。',
            wonders: ['云海', '日出', '佛光']
          },
          {
            id: 4,
            name: '敦煌莫高窟',
            image: 'https://example.com/mogao.jpg',
            description: '敦煌莫高窟是世界文化遗产，以精美的壁画和彩塑闻名于世。',
            wonders: ['壁画', '彩塑', '沙漠']
          }
        ]
      })
      setScenicSpots(data)
    }

    fetchScenicSpots()
  }, [])

  return (
    <View className="container">
      <View className="header">
        <Text>中国文旅地球仪</Text>
      </View>
      
      <View className="tab-bar">
        <TouchableOpacity 
          className={`tab-item ${activeTab === 'earth' ? 'active' : ''}`}
          onPress={() => setActiveTab('earth')}
        >
          <Text>地球仪</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`tab-item ${activeTab === 'wonders' ? 'active' : ''}`}
          onPress={() => setActiveTab('wonders')}
        >
          <Text>自然奇观</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`tab-item ${activeTab === 'scenic' ? 'active' : ''}`}
          onPress={() => setActiveTab('scenic')}
        >
          <Text>景区推荐</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="content" scrollY>
        {activeTab === 'earth' && (
          <View className="earth-section">
            <Text className="section-title">3D地球仪</Text>
            <EarthGlobe />
          </View>
        )}

        {activeTab === 'wonders' && (
          <View className="wonders-section">
            <Text className="section-title">自然奇观</Text>
            <View className="search-box">
              <Text className="search-icon">🔍</Text>
              <Text className="search-placeholder">搜索自然奇观...</Text>
            </View>
            <View className="wonders-grid">
              <TouchableOpacity className="wonder-item" onPress={() => router.push({ path: '/pages/wonder-detail/index', params: { wonderType: '云海' } })}>
                <Image src="https://example.com/cloud-sea.jpg" className="wonder-image" mode="aspectFill" />
                <Text className="wonder-name">云海</Text>
              </TouchableOpacity>
              <TouchableOpacity className="wonder-item" onPress={() => router.push({ path: '/pages/wonder-detail/index', params: { wonderType: '日出' } })}>
                <Image src="https://example.com/sunrise.jpg" className="wonder-image" mode="aspectFill" />
                <Text className="wonder-name">日出</Text>
              </TouchableOpacity>
              <TouchableOpacity className="wonder-item" onPress={() => router.push({ path: '/pages/wonder-detail/index', params: { wonderType: '星空' } })}>
                <Image src="https://example.com/starry-sky.jpg" className="wonder-image" mode="aspectFill" />
                <Text className="wonder-name">星空</Text>
              </TouchableOpacity>
              <TouchableOpacity className="wonder-item" onPress={() => router.push({ path: '/pages/wonder-detail/index', params: { wonderType: '江潮' } })}>
                <Image src="https://example.com/tide.jpg" className="wonder-image" mode="aspectFill" />
                <Text className="wonder-name">江潮</Text>
              </TouchableOpacity>
              <TouchableOpacity className="wonder-item" onPress={() => router.push({ path: '/pages/wonder-detail/index', params: { wonderType: '日照金山' } })}>
                <Image src="https://example.com/golden-mountain.jpg" className="wonder-image" mode="aspectFill" />
                <Text className="wonder-name">日照金山</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'scenic' && (
          <View className="scenic-section">
            <Text className="section-title">景区推荐</Text>
            {scenicSpots.map(spot => (
              <View key={spot.id} className="scenic-item">
                <Image src={spot.image} className="scenic-image" mode="aspectFill" />
                <View className="scenic-info">
                  <Text className="scenic-name">{spot.name}</Text>
                  <Text className="scenic-description">{spot.description}</Text>
                  <View className="scenic-wonders">
                    {spot.wonders.map((wonder, index) => (
                      <View key={index} className="wonder-tag">
                        <Text>{wonder}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default Index
