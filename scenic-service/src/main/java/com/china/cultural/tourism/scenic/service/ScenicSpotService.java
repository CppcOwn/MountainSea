package com.china.cultural.tourism.scenic.service;

import com.china.cultural.tourism.scenic.entity.ScenicSpot;
import com.china.cultural.tourism.scenic.repository.ScenicSpotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class ScenicSpotService {
    @Autowired
    private ScenicSpotRepository scenicSpotRepository;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String SCENIC_SPOT_KEY_PREFIX = "scenic:spot:";
    private static final String SCENIC_SPOTS_LIST_KEY = "scenic:spots:list";
    private static final String SCENIC_SPOTS_LEVEL_KEY_PREFIX = "scenic:spots:level:";
    private static final String SCENIC_SPOTS_REGION_KEY_PREFIX = "scenic:spots:region:";
    
    public List<ScenicSpot> getAllScenicSpots() {
        // 尝试从缓存获取
        List<ScenicSpot> scenicSpots = (List<ScenicSpot>) redisTemplate.opsForValue().get(SCENIC_SPOTS_LIST_KEY);
        if (scenicSpots != null) {
            return scenicSpots;
        }
        
        // 从数据库获取
        scenicSpots = scenicSpotRepository.findAll();
        // 缓存结果，设置过期时间为1小时
        redisTemplate.opsForValue().set(SCENIC_SPOTS_LIST_KEY, scenicSpots, 1, TimeUnit.HOURS);
        return scenicSpots;
    }
    
    public Optional<ScenicSpot> getScenicSpotById(Long id) {
        // 尝试从缓存获取
        String key = SCENIC_SPOT_KEY_PREFIX + id;
        ScenicSpot scenicSpot = (ScenicSpot) redisTemplate.opsForValue().get(key);
        if (scenicSpot != null) {
            return Optional.of(scenicSpot);
        }
        
        // 从数据库获取
        Optional<ScenicSpot> optionalScenicSpot = scenicSpotRepository.findById(id);
        optionalScenicSpot.ifPresent(spot -> {
            // 缓存结果，设置过期时间为2小时
            redisTemplate.opsForValue().set(key, spot, 2, TimeUnit.HOURS);
        });
        return optionalScenicSpot;
    }
    
    public List<ScenicSpot> getScenicSpotsByLevel(String level) {
        // 尝试从缓存获取
        String key = SCENIC_SPOTS_LEVEL_KEY_PREFIX + level;
        List<ScenicSpot> scenicSpots = (List<ScenicSpot>) redisTemplate.opsForValue().get(key);
        if (scenicSpots != null) {
            return scenicSpots;
        }
        
        // 从数据库获取
        scenicSpots = scenicSpotRepository.findByLevelName(level);
        // 缓存结果，设置过期时间为1小时
        redisTemplate.opsForValue().set(key, scenicSpots, 1, TimeUnit.HOURS);
        return scenicSpots;
    }
    
    public List<ScenicSpot> getScenicSpotsByRegion(String region) {
        // 尝试从缓存获取
        String key = SCENIC_SPOTS_REGION_KEY_PREFIX + region;
        List<ScenicSpot> scenicSpots = (List<ScenicSpot>) redisTemplate.opsForValue().get(key);
        if (scenicSpots != null) {
            return scenicSpots;
        }
        
        // 从数据库获取
        scenicSpots = scenicSpotRepository.findByRegionName(region);
        // 缓存结果，设置过期时间为1小时
        redisTemplate.opsForValue().set(key, scenicSpots, 1, TimeUnit.HOURS);
        return scenicSpots;
    }
    
    public ScenicSpot saveScenicSpot(ScenicSpot scenicSpot) {
        ScenicSpot savedScenicSpot = scenicSpotRepository.save(scenicSpot);
        // 清除相关缓存
        clearScenicSpotCache(savedScenicSpot);
        return savedScenicSpot;
    }
    
    public void deleteScenicSpot(Long id) {
        scenicSpotRepository.deleteById(id);
        // 清除相关缓存
        clearScenicSpotCache(id);
    }
    
    private void clearScenicSpotCache(ScenicSpot scenicSpot) {
        // 清除单个景区缓存
        redisTemplate.delete(SCENIC_SPOT_KEY_PREFIX + scenicSpot.getId());
        // 清除列表缓存
        redisTemplate.delete(SCENIC_SPOTS_LIST_KEY);
        // 清除等级缓存
        if (scenicSpot.getLevel() != null) {
            redisTemplate.delete(SCENIC_SPOTS_LEVEL_KEY_PREFIX + scenicSpot.getLevel().getName());
        }
        // 清除地区缓存
        if (scenicSpot.getRegion() != null) {
            redisTemplate.delete(SCENIC_SPOTS_REGION_KEY_PREFIX + scenicSpot.getRegion().getName());
        }
    }
    
    private void clearScenicSpotCache(Long id) {
        // 清除单个景区缓存
        redisTemplate.delete(SCENIC_SPOT_KEY_PREFIX + id);
        // 清除列表缓存
        redisTemplate.delete(SCENIC_SPOTS_LIST_KEY);
        // 注意：这里无法清除等级和地区缓存，因为不知道具体的等级和地区
        // 实际应用中可能需要更复杂的缓存管理策略
    }
}