package com.china.cultural.tourism.scenic.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "region")
public class Region {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String code;
    private String level; // 省、市、县

    @OneToMany(mappedBy = "region")
    private List<ScenicSpot> scenicSpots;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public List<ScenicSpot> getScenicSpots() {
        return scenicSpots;
    }

    public void setScenicSpots(List<ScenicSpot> scenicSpots) {
        this.scenicSpots = scenicSpots;
    }
}