package com.china.cultural.tourism.scenic.repository;

import com.china.cultural.tourism.scenic.entity.ScenicLevel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScenicLevelRepository extends JpaRepository<ScenicLevel, Long> {
    ScenicLevel findByName(String name);
}