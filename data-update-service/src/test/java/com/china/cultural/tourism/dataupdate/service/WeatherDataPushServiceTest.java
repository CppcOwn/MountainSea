package com.china.cultural.tourism.dataupdate.service;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.kafka.core.KafkaTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import static org.mockito.Mockito.*;

class WeatherDataPushServiceTest {
    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @InjectMocks
    private WeatherDataPushService weatherDataPushService;
    
    public WeatherDataPushServiceTest() {
        MockitoAnnotations.openMocks(this);
    }
    
    @Test
    void testPushWeatherData() throws Exception {
        // 创建测试数据
        Map<String, Object> weatherData = new HashMap<>();
        weatherData.put("scenicId", 1L);
        weatherData.put("temperature", 25.5);
        weatherData.put("humidity", 60);
        
        // 模拟objectMapper.writeValueAsString方法
        when(objectMapper.writeValueAsString(weatherData)).thenReturn("{\"scenicId\": 1, \"temperature\": 25.5, \"humidity\": 60}");
        
        // 调用推送天气数据方法
        weatherDataPushService.pushWeatherData(weatherData);
        
        // 验证KafkaTemplate的send方法被调用
        verify(kafkaTemplate, times(1)).send("weather-data-updates", "{\"scenicId\": 1, \"temperature\": 25.5, \"humidity\": 60}");
    }
    
    @Test
    void testPushWeatherDataBatch() throws Exception {
        // 创建测试数据
        Map<String, Object> weatherData1 = new HashMap<>();
        weatherData1.put("scenicId", 1L);
        weatherData1.put("temperature", 25.5);
        weatherData1.put("humidity", 60);
        
        Map<String, Object> weatherData2 = new HashMap<>();
        weatherData2.put("scenicId", 2L);
        weatherData2.put("temperature", 28.0);
        weatherData2.put("humidity", 55);
        
        List<Map<String, Object>> weatherDataList = List.of(weatherData1, weatherData2);
        
        // 模拟objectMapper.writeValueAsString方法
        when(objectMapper.writeValueAsString(weatherData1)).thenReturn("{\"scenicId\": 1, \"temperature\": 25.5, \"humidity\": 60}");
        when(objectMapper.writeValueAsString(weatherData2)).thenReturn("{\"scenicId\": 2, \"temperature\": 28.0, \"humidity\": 55}");
        
        // 调用批量推送天气数据方法
        weatherDataPushService.pushWeatherDataBatch(weatherDataList);
        
        // 验证KafkaTemplate的send方法被调用了两次
        verify(kafkaTemplate, times(1)).send("weather-data-updates", "{\"scenicId\": 1, \"temperature\": 25.5, \"humidity\": 60}");
        verify(kafkaTemplate, times(1)).send("weather-data-updates", "{\"scenicId\": 2, \"temperature\": 28.0, \"humidity\": 55}");
    }
}
