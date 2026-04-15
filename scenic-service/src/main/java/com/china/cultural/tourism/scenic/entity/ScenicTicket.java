package com.china.cultural.tourism.scenic.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "scenic_ticket")
public class ScenicTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // 成人票、儿童票、学生票等
    private Double price;
    private String description;

    @ManyToOne
    @JoinColumn(name = "scenic_spot_id")
    private ScenicSpot scenicSpot;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ScenicSpot getScenicSpot() {
        return scenicSpot;
    }

    public void setScenicSpot(ScenicSpot scenicSpot) {
        this.scenicSpot = scenicSpot;
    }
}