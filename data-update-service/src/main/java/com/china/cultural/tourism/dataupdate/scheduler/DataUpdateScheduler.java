package com.china.cultural.tourism.dataupdate.scheduler;

import com.china.cultural.tourism.dataupdate.feign.ScenicServiceClient;
import com.china.cultural.tourism.dataupdate.feign.WeatherServiceClient;
import com.china.cultural.tourism.dataupdate.service.StaticDataUpdateService;
import com.china.cultural.tourism.dataupdate.service.WeatherDataPushService;
import com.china.cultural.tourism.dataupdate.service.DataUpdateStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class DataUpdateScheduler {
    @Autowired
    private ScenicServiceClient scenicServiceClient;
    
    @Autowired
    private WeatherServiceClient weatherServiceClient;
    
    @Autowired
    private StaticDataUpdateService staticDataUpdateService;
    
    @Autowired
    private WeatherDataPushService weatherDataPushService;
    
    @Autowired
    private DataUpdateStatusService dataUpdateStatusService;
    
    // 定时更新静态数据（每天凌晨0点执行）
    @Scheduled(cron = "${schedule.static-data.cron}")
    public void updateStaticData() {
        System.out.println("Updating static data...");
        staticDataUpdateService.updateStaticData();
    }
    
    // 定时更新天气数据（每30分钟执行一次）
    @Scheduled(cron = "${schedule.weather-data.cron}")
    public void updateWeatherData() {
        try {
            // 更新数据更新状态为进行中
            dataUpdateStatusService.updateDataUpdateStatus("weather-data", "in-progress", "开始更新天气数据");
            
            // 从景区服务获取所有景区信息
            List<Map<String, Object>> scenicSpots = scenicServiceClient.getAllScenicSpots();
            
            // 提取景区ID、纬度和经度
            List<Long> scenicIds = new ArrayList<>();
            List<Double> latitudes = new ArrayList<>();
            List<Double> longitudes = new ArrayList<>();
            
            for (Map<String, Object> scenicSpot : scenicSpots) {
                Long id = Long.valueOf(scenicSpot.get("id").toString());
                Double latitude = Double.valueOf(scenicSpot.get("latitude").toString());
                Double longitude = Double.valueOf(scenicSpot.get("longitude").toString());
                
                scenicIds.add(id);
                latitudes.add(latitude);
                longitudes.add(longitude);
            }
            
            // 调用天气服务更新天气数据
            WeatherServiceClient.BatchWeatherSyncRequest request = new WeatherServiceClient.BatchWeatherSyncRequest();
            request.setScenicIds(scenicIds);
            request.setLatitudes(latitudes);
            request.setLongitudes(longitudes);
            
            weatherServiceClient.syncWeatherDataBatch(request);
            System.out.println("Updating weather data for " + scenicIds.size() + " scenic spots");
            
            // 获取更新后的天气数据
            List<Map<String, Object>> updatedWeatherData = weatherServiceClient.getBatchWeatherData(scenicIds);
            
            // 推送天气数据到Kafka
            weatherDataPushService.pushWeatherDataBatch(updatedWeatherData);
            System.out.println("Pushed weather data to Kafka for " + updatedWeatherData.size() + " scenic spots");
            
            // 更新数据更新状态为成功
            dataUpdateStatusService.updateDataUpdateStatus("weather-data", "success", "天气数据更新成功，更新了 " + updatedWeatherData.size() + " 个景区的天气数据");
        } catch (Exception e) {
            // 更新数据更新状态为失败
            dataUpdateStatusService.updateDataUpdateStatus("weather-data", "failed", "天气数据更新失败: " + e.getMessage());
            System.err.println("Failed to update weather data: " + e.getMessage());
            e.printStackTrace();
        }
    }
}