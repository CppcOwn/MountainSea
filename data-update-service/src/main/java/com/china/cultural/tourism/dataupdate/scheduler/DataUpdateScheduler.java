package com.china.cultural.tourism.dataupdate.scheduler;

import com.china.cultural.tourism.dataupdate.feign.ScenicServiceClient;
import com.china.cultural.tourism.dataupdate.feign.WeatherServiceClient;
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
    
    // 定时更新静态数据（每天凌晨0点执行）
    @Scheduled(cron = "${schedule.static-data.cron}")
    public void updateStaticData() {
        // 这里可以实现静态数据的更新逻辑
        // 例如从外部数据源获取最新的景区信息，然后更新到数据库
        System.out.println("Updating static data...");
        // 实际实现中，这里可以调用外部API获取数据，然后更新到数据库
    }
    
    // 定时更新天气数据（每30分钟执行一次）
    @Scheduled(cron = "${schedule.weather-data.cron}")
    public void updateWeatherData() {
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
    }
}