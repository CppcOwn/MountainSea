package com.china.cultural.tourism.weather.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@EnableScheduling
public class WeatherUpdateScheduler {
    
    @Autowired
    private WeatherService weatherService;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Value("${scenic.service.url:http://localhost:8081/api/scenic-spots}")
    private String scenicServiceUrl;
    
    // 每30分钟执行一次天气数据更新
    @Scheduled(fixedRate = 1800000) // 30分钟，单位毫秒
    public void updateWeatherDataForAllScenicSpots() {
        try {
            // 从景区服务获取所有景区数据
            String response = restTemplate.getForObject(scenicServiceUrl, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            
            List<Long> scenicIds = new ArrayList<>();
            List<Double> latitudes = new ArrayList<>();
            List<Double> longitudes = new ArrayList<>();
            
            // 解析景区数据
            if (rootNode.isArray()) {
                for (JsonNode spotNode : rootNode) {
                    Long id = spotNode.path("id").asLong();
                    Double latitude = spotNode.path("latitude").asDouble();
                    Double longitude = spotNode.path("longitude").asDouble();
                    
                    scenicIds.add(id);
                    latitudes.add(latitude);
                    longitudes.add(longitude);
                }
            }
            
            // 更新天气数据
            if (!scenicIds.isEmpty()) {
                weatherService.updateWeatherDataForAllScenicSpots(scenicIds, latitudes, longitudes);
                System.out.println("Weather data updated for " + scenicIds.size() + " scenic spots");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to update weather data: " + e.getMessage());
        }
    }
}