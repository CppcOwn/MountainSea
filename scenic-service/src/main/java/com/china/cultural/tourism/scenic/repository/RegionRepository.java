package com.china.cultural.tourism.scenic.repository;

import com.china.cultural.tourism.scenic.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegionRepository extends JpaRepository<Region, Long> {
    List<Region> findByLevel(String level);
    Region findByName(String name);
    Region findByCode(String code);
}