import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { cacheRequest } from '../../utils/cache'
import './index.css'

function WonderDetail() {
  const router = useRouter()
  const { wonderType } = router.params
  const [wonderInfo, setWonderInfo] = useState({})
  const [scenicSpots, setScenicSpots] = useState([])

  // 模拟自然奇观数据，使用缓存优化性能
  useEffect(() => {
    const fetchWonderInfo = async () => {
      // 缓存自然奇观数据
      const wonderData = await cacheRequest('wonder_data', () => {
        return {
          '云海': {
            name: '云海',
            description: '云海是指在一定的天气条件下形成的云层，并且云顶高度低于山顶高度，当人们在高山之巅俯首云层时，看到的是漫无边际的云，如临于大海之滨，波起峰涌，浪花飞溅，惊涛拍岸。',
            bestTime: '春秋两季，尤其是雨后初晴',
            image: 'https://example.com/cloud-sea-detail.jpg'
          },
          '日出': {
            name: '日出',
            description: '日出是指太阳从地平线升起的自然现象，通常发生在清晨。在高山、海边等视野开阔的地方，日出景观尤为壮观，太阳从东方缓缓升起，光芒四射，给大地带来光明和温暖。',
            bestTime: '夏季清晨5-6点，冬季清晨6-7点',
            image: 'https://example.com/sunrise-detail.jpg'
          },
          '星空': {
            name: '星空',
            description: '星空是指夜晚天空中星星闪烁的景象。在远离城市光污染的地方，星空尤为美丽，银河清晰可见，星星如钻石般点缀在夜空中，令人心旷神怡。',
            bestTime: '晴朗的夜晚，尤其是夏季和秋季',
            image: 'https://example.com/starry-sky-detail.jpg'
          },
          '江潮': {
            name: '江潮',
            description: '江潮是指江河中由于月球和太阳的引力作用而产生的潮汐现象。钱塘江大潮是中国最著名的江潮，以其壮观的景象吸引了无数游客。',
            bestTime: '农历八月十八前后',
            image: 'https://example.com/tide-detail.jpg'
          },
          '日照金山': {
            name: '日照金山',
            description: '日照金山是指太阳照射在雪山之巅，使雪山呈现出金黄色的壮观景象。这种现象通常发生在日出或日落时分，阳光照射在雪山上，反射出金色的光芒。',
            bestTime: '日出或日落时分',
            image: 'https://example.com/golden-mountain-detail.jpg'
          }
        }
      })

      setWonderInfo(wonderData[wonderType] || wonderData['云海'])

      // 缓存相关景区数据
      const spotsData = await cacheRequest(`scenic_spots_${wonderType}`, () => {
        return [
          {
            id: 1,
            name: '黄山',
            image: 'https://example.com/huangshan.jpg',
            description: '黄山云海是中国最著名的云海景观之一，以其变幻莫测、气势磅礴而著称。',
            rating: 5
          },
          {
            id: 2,
            name: '峨眉山',
            image: 'https://example.com/emeishan.jpg',
            description: '峨眉山云海以其浩瀚壮阔、变幻无穷而闻名，是观赏云海的绝佳地点。',
            rating: 4.8
          },
          {
            id: 3,
            name: '庐山',
            image: 'https://example.com/lushan.jpg',
            description: '庐山云海以其云雾缭绕、变幻莫测而著称，素有"匡庐奇秀甲天下"之美誉。',
            rating: 4.7
          }
        ]
      })

      setScenicSpots(spotsData)
    }

    fetchWonderInfo()
  }, [wonderType])

  return (
    <View className="container">
      <View className="header">
        <TouchableOpacity className="back-button" onPress={() => router.back()}>
          <Text className="back-text">←</Text>
        </TouchableOpacity>
        <Text className="header-title">{wonderInfo.name}</Text>
        <View className="header-right"></View>
      </View>

      <ScrollView className="content" scrollY>
        <Image src={wonderInfo.image} className="wonder-image" mode="aspectFill" />
        
        <View className="info-section">
          <Text className="info-title">奇观介绍</Text>
          <Text className="info-text">{wonderInfo.description}</Text>
        </View>

        <View className="info-section">
          <Text className="info-title">最佳观赏时间</Text>
          <Text className="info-text">{wonderInfo.bestTime}</Text>
        </View>

        <View className="scenic-section">
          <Text className="section-title">推荐观赏地点</Text>
          {scenicSpots.map(spot => (
            <View key={spot.id} className="scenic-item">
              <Image src={spot.image} className="scenic-image" mode="aspectFill" />
              <View className="scenic-info">
                <Text className="scenic-name">{spot.name}</Text>
                <Text className="scenic-rating">评分: {spot.rating}</Text>
                <Text className="scenic-description">{spot.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default WonderDetail
