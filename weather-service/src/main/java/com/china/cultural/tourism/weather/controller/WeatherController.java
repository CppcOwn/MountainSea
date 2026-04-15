package com.china.cultural.tourism.weather.controller;

import com.china.cultural.tourism.weather.entity.WeatherData;
import com.china.cultural.tourism.weather.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {
    @Autowired
    private WeatherService weatherService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @GetMapping("/{scenicId}")
    public ResponseEntity<WeatherData> getWeatherByScenicId(@PathVariable Long scenicId) {
        Optional<WeatherData> weatherData = weatherService.getWeatherByScenicId(scenicId);
        return weatherData.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping("/batch")
    public ResponseEntity<List<WeatherData>> getWeatherByScenicIds(@RequestBody List<Long> scenicIds) {
        List<WeatherData> weatherDataList = weatherService.getWeatherByScenicIds(scenicIds);
        return new ResponseEntity<>(weatherDataList, HttpStatus.OK);
    }
    
    @PostMapping("/sync/{scenicId}")
    public ResponseEntity<WeatherData> syncWeatherData(@PathVariable Long scenicId, @RequestParam Double latitude, @RequestParam Double longitude) {
        WeatherData weatherData = weatherService.fetchAndSaveWeatherData(scenicId, latitude, longitude);
        if (weatherData != null) {
            return new ResponseEntity<>(weatherData, HttpStatus.OK);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/sync/batch")
    public ResponseEntity<Void> syncWeatherDataBatch(@RequestBody BatchWeatherSyncRequest request) {
        weatherService.updateWeatherDataForAllScenicSpots(request.getScenicIds(), request.getLatitudes(), request.getLongitudes());
        return ResponseEntity.noContent().build();
    }
    
    // WebSocket消息处理方法，用于实时推送天气数据
    public void sendWeatherUpdate(WeatherData weatherData) {
        messagingTemplate.convertAndSend("/topic/weather-updates", weatherData);
    }
    
    // 批量天气同步请求DTO
    public static class BatchWeatherSyncRequest {
        private List<Long> scenicIds;
        private List<Double> latitudes;
        private List<Double> longitudes;
        
        // Getters and setters
        public List<Long> getScenicIds() {
            return scenicIds;
        }
        
        public void setScenicIds(List<Long> scenicIds) {
            this.scenicIds = scenicIds;
        }
        
        public List<Double> getLatitudes() {
            return latitudes;
        }
        
        public void setLatitudes(List<Double> latitudes) {
            this.latitudes = latitudes;
        }
        
        public List<Double> getLongitudes() {
            return longitudes;
        }
        
        public void setLongitudes(List<Double> longitudes) {
            this.longitudes = longitudes;
        }
    }
}