package com.china.cultural.tourism.weather.service;

import com.china.cultural.tourism.weather.entity.WeatherData;
import com.china.cultural.tourism.weather.repository.WeatherDataRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class WeatherService {
    @Autowired
    private WeatherDataRepository weatherDataRepository;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Value("${weather.api.key}")
    private String weatherApiKey;
    
    @Value("${weather.api.base-url}")
    private String weatherApiBaseUrl;
    
    private static final String WEATHER_DATA_KEY_PREFIX = "weather:data:";
    private static final String WEATHER_TOPIC = "weather-updates";
    private final OkHttpClient httpClient = new OkHttpClient();
    
    public Optional<WeatherData> getWeatherByScenicId(Long scenicId) {
        // 尝试从缓存获取
        String key = WEATHER_DATA_KEY_PREFIX + scenicId;
        WeatherData weatherData = (WeatherData) redisTemplate.opsForValue().get(key);
        if (weatherData != null) {
            return Optional.of(weatherData);
        }
        
        // 从数据库获取最新天气数据
        Optional<WeatherData> optionalWeatherData = weatherDataRepository.findTopByScenicSpotIdOrderByUpdateTimeDesc(scenicId);
        optionalWeatherData.ifPresent(data -> {
            // 缓存结果，设置过期时间为30分钟
            redisTemplate.opsForValue().set(key, data, 30, TimeUnit.MINUTES);
        });
        return optionalWeatherData;
    }
    
    public List<WeatherData> getWeatherByScenicIds(List<Long> scenicIds) {
        return weatherDataRepository.findLatestByScenicSpotIds(scenicIds);
    }
    
    public WeatherData fetchAndSaveWeatherData(Long scenicId, Double latitude, Double longitude) {
        try {
            // 从天气API获取数据
            String url = weatherApiBaseUrl + "/current.json?key=" + weatherApiKey + "&q=" + latitude + "," + longitude;
            Request request = new Request.Builder().url(url).build();
            Response response = httpClient.newCall(request).execute();
            
            if (response.isSuccessful() && response.body() != null) {
                String responseBody = response.body().string();
                JsonNode rootNode = objectMapper.readTree(responseBody);
                
                // 解析天气数据
                WeatherData weatherData = new WeatherData();
                weatherData.setScenicSpotId(scenicId);
                weatherData.setTemperature(rootNode.path("current").path("temp_c").asDouble());
                weatherData.setWeatherCondition(rootNode.path("current").path("condition").path("text").asText());
                weatherData.setWindDirection(rootNode.path("current").path("wind_dir").asText());
                weatherData.setWindSpeed(rootNode.path("current").path("wind_kph").asDouble());
                weatherData.setHumidity(rootNode.path("current").path("humidity").asInt());
                weatherData.setClothingRecommendation(getClothingRecommendation(rootNode.path("current").path("temp_c").asDouble()));
                weatherData.setUpdateTime(LocalDateTime.now());
                
                // 保存到数据库
                WeatherData savedWeatherData = weatherDataRepository.save(weatherData);
                
                // 缓存到Redis
                String key = WEATHER_DATA_KEY_PREFIX + scenicId;
                redisTemplate.opsForValue().set(key, savedWeatherData, 30, TimeUnit.MINUTES);
                
                // 发送到Kafka，用于实时推送
                String weatherJson = objectMapper.writeValueAsString(savedWeatherData);
                kafkaTemplate.send(WEATHER_TOPIC, weatherJson);
                
                return savedWeatherData;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
    
    private String getClothingRecommendation(double temperature) {
        if (temperature < 0) {
            return "建议穿着厚羽绒服、帽子、手套等保暖衣物";
        } else if (temperature < 10) {
            return "建议穿着棉衣、羊毛衫等保暖衣物";
        } else if (temperature < 20) {
            return "建议穿着长袖衬衫、薄外套等";
        } else if (temperature < 30) {
            return "建议穿着短袖、短裤等夏季衣物";
        } else {
            return "建议穿着轻薄透气的夏季衣物，注意防晒";
        }
    }
    
    public void updateWeatherDataForAllScenicSpots(List<Long> scenicIds, List<Double> latitudes, List<Double> longitudes) {
        for (int i = 0; i < scenicIds.size(); i++) {
            fetchAndSaveWeatherData(scenicIds.get(i), latitudes.get(i), longitudes.get(i));
        }
    }
}