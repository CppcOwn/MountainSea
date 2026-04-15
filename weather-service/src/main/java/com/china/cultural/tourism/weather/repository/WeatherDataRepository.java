package com.china.cultural.tourism.weather.repository;

import com.china.cultural.tourism.weather.entity.WeatherData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WeatherDataRepository extends JpaRepository<WeatherData, Long> {
    Optional<WeatherData> findTopByScenicSpotIdOrderByUpdateTimeDesc(Long scenicSpotId);
    
    @Query("SELECT w FROM WeatherData w WHERE w.scenicSpotId IN :scenicSpotIds ORDER BY w.updateTime DESC")
    List<WeatherData> findLatestByScenicSpotIds(@Param("scenicSpotIds") List<Long> scenicSpotIds);
}