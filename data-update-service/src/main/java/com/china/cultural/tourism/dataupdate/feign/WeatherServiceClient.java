package com.china.cultural.tourism.dataupdate.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.util.Map;

@FeignClient(name = "weather-service")
public interface WeatherServiceClient {
    @PostMapping("/api/weather/sync/batch")
    void syncWeatherDataBatch(@RequestBody BatchWeatherSyncRequest request);
    
    @GetMapping("/api/weather/batch")
    List<Map<String, Object>> getBatchWeatherData(@RequestParam("scenicIds") List<Long> scenicIds);
    
    // 批量天气同步请求DTO
    class BatchWeatherSyncRequest {
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