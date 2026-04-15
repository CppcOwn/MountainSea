package com.china.cultural.tourism.common.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class CommonController {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String REGIONS_KEY = "common:regions";
    private static final String SCENIC_LEVELS_KEY = "common:scenic-levels";
    private static final String STATS_KEY = "common:stats";
    
    @GetMapping("/regions")
    public ResponseEntity<List<Map<String, Object>>> getRegions() {
        // 尝试从缓存获取
        List<Map<String, Object>> regions = (List<Map<String, Object>>) redisTemplate.opsForValue().get(REGIONS_KEY);
        if (regions != null) {
            return new ResponseEntity<>(regions, HttpStatus.OK);
        }
        
        // 从数据库获取（这里使用模拟数据）
        regions = new ArrayList<>();
        
        // 模拟省级地区数据
        Map<String, Object> region1 = new HashMap<>();
        region1.put("id", 1);
        region1.put("name", "北京市");
        region1.put("code", "110000");
        region1.put("level", "省");
        regions.add(region1);
        
        Map<String, Object> region2 = new HashMap<>();
        region2.put("id", 2);
        region2.put("name", "上海市");
        region2.put("code", "310000");
        region2.put("level", "省");
        regions.add(region2);
        
        Map<String, Object> region3 = new HashMap<>();
        region3.put("id", 3);
        region3.put("name", "广东省");
        region3.put("code", "440000");
        region3.put("level", "省");
        regions.add(region3);
        
        // 缓存结果，设置过期时间为1天
        redisTemplate.opsForValue().set(REGIONS_KEY, regions, 1, TimeUnit.DAYS);
        
        return new ResponseEntity<>(regions, HttpStatus.OK);
    }
    
    @GetMapping("/scenic-levels")
    public ResponseEntity<List<Map<String, Object>>> getScenicLevels() {
        // 尝试从缓存获取
        List<Map<String, Object>> scenicLevels = (List<Map<String, Object>>) redisTemplate.opsForValue().get(SCENIC_LEVELS_KEY);
        if (scenicLevels != null) {
            return new ResponseEntity<>(scenicLevels, HttpStatus.OK);
        }
        
        // 从数据库获取（这里使用模拟数据）
        scenicLevels = new ArrayList<>();
        
        Map<String, Object> level1 = new HashMap<>();
        level1.put("id", 1);
        level1.put("name", "5A");
        level1.put("description", "国家5A级旅游景区");
        scenicLevels.add(level1);
        
        Map<String, Object> level2 = new HashMap<>();
        level2.put("id", 2);
        level2.put("name", "4A");
        level2.put("description", "国家4A级旅游景区");
        scenicLevels.add(level2);
        
        Map<String, Object> level3 = new HashMap<>();
        level3.put("id", 3);
        level3.put("name", "3A");
        level3.put("description", "国家3A级旅游景区");
        scenicLevels.add(level3);
        
        // 缓存结果，设置过期时间为1天
        redisTemplate.opsForValue().set(SCENIC_LEVELS_KEY, scenicLevels, 1, TimeUnit.DAYS);
        
        return new ResponseEntity<>(scenicLevels, HttpStatus.OK);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        // 尝试从缓存获取
        Map<String, Object> stats = (Map<String, Object>) redisTemplate.opsForValue().get(STATS_KEY);
        if (stats != null) {
            return new ResponseEntity<>(stats, HttpStatus.OK);
        }
        
        // 计算统计数据（这里使用模拟数据）
        stats = new HashMap<>();
        stats.put("totalScenicSpots", 1234);
        stats.put("total5AScenicSpots", 250);
        stats.put("total4AScenicSpots", 680);
        stats.put("total3AScenicSpots", 304);
        stats.put("totalRegions", 34);
        
        // 缓存结果，设置过期时间为1小时
        redisTemplate.opsForValue().set(STATS_KEY, stats, 1, TimeUnit.HOURS);
        
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }
}