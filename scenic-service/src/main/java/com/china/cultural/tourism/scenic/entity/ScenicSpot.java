package com.china.cultural.tourism.scenic.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "scenic_spot")
public class ScenicSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private String address;
    private String officialWebsite;

    @ManyToOne
    @JoinColumn(name = "level_id")
    private ScenicLevel level;

    @ManyToOne
    @JoinColumn(name = "region_id")
    private Region region;

    @OneToMany(mappedBy = "scenicSpot", cascade = CascadeType.ALL)
    private List<ScenicImage> images;

    @OneToMany(mappedBy = "scenicSpot", cascade = CascadeType.ALL)
    private List<ScenicTicket> tickets;

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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getOfficialWebsite() {
        return officialWebsite;
    }

    public void setOfficialWebsite(String officialWebsite) {
        this.officialWebsite = officialWebsite;
    }

    public ScenicLevel getLevel() {
        return level;
    }

    public void setLevel(ScenicLevel level) {
        this.level = level;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public List<ScenicImage> getImages() {
        return images;
    }

    public void setImages(List<ScenicImage> images) {
        this.images = images;
    }

    public List<ScenicTicket> getTickets() {
        return tickets;
    }

    public void setTickets(List<ScenicTicket> tickets) {
        this.tickets = tickets;
    }
}