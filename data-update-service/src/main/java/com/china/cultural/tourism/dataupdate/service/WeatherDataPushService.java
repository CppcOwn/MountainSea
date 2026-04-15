package com.china.cultural.tourism.dataupdate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Service
public class WeatherDataPushService {
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // Kafka主题
    private static final String WEATHER_DATA_TOPIC = "weather-data-updates";
    
    /**
     * 推送天气数据到Kafka
     * @param weatherData 天气数据
     */
    public void pushWeatherData(Map<String, Object> weatherData) {
        try {
            // 将天气数据转换为JSON字符串
            String weatherDataJson = objectMapper.writeValueAsString(weatherData);
            
            // 推送到Kafka
            kafkaTemplate.send(WEATHER_DATA_TOPIC, weatherDataJson);
            
            System.out.println("Weather data pushed to Kafka: " + weatherData.get("scenicId"));
        } catch (Exception e) {
            System.err.println("Failed to push weather data to Kafka: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 批量推送天气数据到Kafka
     * @param weatherDataList 天气数据列表
     */
    public void pushWeatherDataBatch(java.util.List<Map<String, Object>> weatherDataList) {
        for (Map<String, Object> weatherData : weatherDataList) {
            pushWeatherData(weatherData);
        }
    }
}
