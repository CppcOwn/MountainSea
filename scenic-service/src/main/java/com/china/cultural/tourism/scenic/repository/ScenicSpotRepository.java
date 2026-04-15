package com.china.cultural.tourism.scenic.repository;

import com.china.cultural.tourism.scenic.entity.ScenicSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ScenicSpotRepository extends JpaRepository<ScenicSpot, Long> {
    List<ScenicSpot> findByLevelName(String levelName);
    List<ScenicSpot> findByRegionName(String regionName);
    
    @Query("SELECT s FROM ScenicSpot s WHERE s.latitude BETWEEN :minLat AND :maxLat AND s.longitude BETWEEN :minLng AND :maxLng")
    List<ScenicSpot> findByCoordinates(@Param("minLat") Double minLat, @Param("maxLat") Double maxLat, @Param("minLng") Double minLng, @Param("maxLng") Double maxLng);
}