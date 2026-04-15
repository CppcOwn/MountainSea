package com.china.cultural.tourism.scenic.repository;

import com.china.cultural.tourism.scenic.entity.ScenicSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ScenicSpotRepository extends JpaRepository<ScenicSpot, Long> {
    @Query("SELECT s FROM ScenicSpot s LEFT JOIN FETCH s.images LEFT JOIN FETCH s.tickets LEFT JOIN FETCH s.level LEFT JOIN FETCH s.region")
    List<ScenicSpot> findAllWithDetails();
    
    @Query("SELECT s FROM ScenicSpot s LEFT JOIN FETCH s.images LEFT JOIN FETCH s.tickets LEFT JOIN FETCH s.level LEFT JOIN FETCH s.region")
    List<ScenicSpot> findAllWithDetails(int page, int size);
    
    @Query("SELECT s FROM ScenicSpot s LEFT JOIN FETCH s.images LEFT JOIN FETCH s.tickets LEFT JOIN FETCH s.level LEFT JOIN FETCH s.region WHERE s.level.name = :levelName")
    List<ScenicSpot> findByLevelName(String levelName);
    
    @Query("SELECT s FROM ScenicSpot s LEFT JOIN FETCH s.images LEFT JOIN FETCH s.tickets LEFT JOIN FETCH s.level LEFT JOIN FETCH s.region WHERE s.region.name = :regionName")
    List<ScenicSpot> findByRegionName(String regionName);
    
    @Query("SELECT s FROM ScenicSpot s LEFT JOIN FETCH s.images LEFT JOIN FETCH s.tickets LEFT JOIN FETCH s.level LEFT JOIN FETCH s.region WHERE s.id = :id")
    ScenicSpot findByIdWithDetails(Long id);
    
    @Query("SELECT s FROM ScenicSpot s LEFT JOIN FETCH s.images LEFT JOIN FETCH s.tickets LEFT JOIN FETCH s.level LEFT JOIN FETCH s.region WHERE s.latitude BETWEEN :minLat AND :maxLat AND s.longitude BETWEEN :minLng AND :maxLng")
    List<ScenicSpot> findByCoordinates(@Param("minLat") Double minLat, @Param("maxLat") Double maxLat, @Param("minLng") Double minLng, @Param("maxLng") Double maxLng);
}