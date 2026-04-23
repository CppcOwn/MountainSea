import React, { useEffect, useRef, useState } from 'react';
import { Scene, PointLayer } from '@antv/l7';
import { Mapbox } from '@antv/l7-maps';

const PointCloudMap = ({ scenicSpots, isMobile, isTablet, isDesktop }) => {
  const mapRef = useRef(null);
  const sceneRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [filteredSpots, setFilteredSpots] = useState(scenicSpots);

  // 处理等级筛选
  useEffect(() => {
    if (selectedLevel === 'all') {
      setFilteredSpots(scenicSpots);
    } else {
      const filtered = scenicSpots.filter(spot => spot.level.name === selectedLevel);
      setFilteredSpots(filtered);
    }
  }, [selectedLevel, scenicSpots]);

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) return;

    // 创建L7场景
    const scene = new Scene({
      id: 'point-cloud-map',
      map: new Mapbox({
        style: 'dark',
        center: [104.195397, 35.86166],
        zoom: 3.5,
        pitch: 30,
        rotation: 0
      }),
      renderer: 'webgl'
    });

    sceneRef.current = scene;

    // 监听地图加载完成
    scene.on('loaded', () => {
      updatePointLayer();
    });

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
      }
    };
  }, []);

  // 更新点图层
  useEffect(() => {
    if (!sceneRef.current) return;

    updatePointLayer();
  }, [filteredSpots]);

  // 更新点图层
  const updatePointLayer = () => {
    if (!sceneRef.current) return;

    // 清除现有图层
    sceneRef.current.clearLayers();

    // 准备点云数据
    const pointData = filteredSpots.map(spot => ({
      lng: spot.longitude,
      lat: spot.latitude,
      name: spot.name,
      level: spot.level.name,
      description: spot.description,
      address: spot.address,
      price: spot.tickets && spot.tickets.length > 0 ? spot.tickets[0].price : 0
    }));

    // 创建点图层
    const pointLayer = new PointLayer()
      .source(pointData, {
        parser: {
          type: 'json',
          x: 'lng',
          y: 'lat'
        }
      })
      .shape('circle')
      .size('price', [10, 30])
      .color('level', value => {
        switch (value) {
          case '5A': return '#FFD700'; // 金色
          case '4A': return '#C0C0C0'; // 银色
          case '3A': return '#CD7F32'; // 铜色
          default: return '#808080'; // 灰色
        }
      })
      .style({
        opacity: 0.8,
        strokeWidth: 2,
        stroke: '#ffffff',
        blur: 1
      })
      .active({
        strokeWidth: 3,
        stroke: '#00ffff',
        blur: 3
      })
      .select({
        strokeWidth: 4,
        stroke: '#ff4500',
        blur: 5
      });

    // 添加图层到场景
    sceneRef.current.addLayer(pointLayer);

    // 添加交互
    pointLayer.on('click', e => {
      const { feature } = e;
      if (feature) {
        // 可以在这里添加点击事件处理，比如显示景区详情
        console.log('点击了景区:', feature.properties.name);
      }
    });
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      position: 'relative'
    }}>
      {/* 标题 */}
      <div style={{ 
        position: 'absolute', 
        top: isMobile ? '10px' : '20px', 
        left: isMobile ? '10px' : '20px', 
        zIndex: 10, 
        color: '#fff', 
        fontSize: isMobile ? '16px' : isTablet ? '20px' : '24px', 
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' 
      }}>
        中国文旅地球仪 - 点云地图
      </div>

      {/* 地图容器 */}
      <div 
        ref={mapRef}
        id="point-cloud-map"
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative'
        }}
      />

      {/* 控制按钮 */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '10px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #00ffff',
        borderRadius: '10px',
        padding: isMobile ? '10px' : '15px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '10px' : '15px',
        zIndex: 10
      }}>
        {/* 等级筛选 */}
        <select 
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={{
            padding: isMobile ? '6px 12px' : '8px 16px',
            background: 'rgba(0, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid #00ffff',
            borderRadius: '5px',
            fontSize: isMobile ? '14px' : '16px'
          }}
        >
          <option value="all">全部等级</option>
          <option value="5A">5A级</option>
          <option value="4A">4A级</option>
          <option value="3A">3A级</option>
        </select>

        {/* 景区数量 */}
        <div style={{
          color: '#00ffff',
          fontSize: isMobile ? '14px' : '16px',
          display: 'flex',
          alignItems: 'center'
        }}>
          景区数量: {filteredSpots.length}
        </div>
      </div>
    </div>
  );
};

export default PointCloudMap;