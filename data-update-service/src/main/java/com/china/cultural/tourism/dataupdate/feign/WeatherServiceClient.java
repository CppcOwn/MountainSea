package com.china.cultural.tourism.dataupdate.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;

@FeignClient(name = "weather-service")
public interface WeatherServiceClient {
    @PostMapping("/api/weather/sync/batch")
    void syncWeatherDataBatch(@RequestBody BatchWeatherSyncRequest request);
    
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