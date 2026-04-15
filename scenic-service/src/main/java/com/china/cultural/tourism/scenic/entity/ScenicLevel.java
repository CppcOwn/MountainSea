package com.china.cultural.tourism.scenic.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "scenic_level")
public class ScenicLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // 5A, 4A, 3A
    private String description;

    @OneToMany(mappedBy = "level")
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<ScenicSpot> getScenicSpots() {
        return scenicSpots;
    }

    public void setScenicSpots(List<ScenicSpot> scenicSpots) {
        this.scenicSpots = scenicSpots;
    }
}