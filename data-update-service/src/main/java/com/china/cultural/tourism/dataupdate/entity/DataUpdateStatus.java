package com.china.cultural.tourism.dataupdate.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "data_update_status")
public class DataUpdateStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "data_type", nullable = false)
    private String dataType; // static-data, weather-data
    
    @Column(name = "update_status", nullable = false)
    private String updateStatus; // success, failed, in-progress
    
    @Column(name = "last_update_time")
    private Date lastUpdateTime;
    
    @Column(name = "next_update_time")
    private Date nextUpdateTime;
    
    @Column(name = "update_count")
    private Integer updateCount = 0;
    
    @Column(name = "last_update_message")
    private String lastUpdateMessage;
    
    @Column(name = "created_at", nullable = false)
    private Date createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Date updatedAt;
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDataType() {
        return dataType;
    }
    
    public void setDataType(String dataType) {
        this.dataType = dataType;
    }
    
    public String getUpdateStatus() {
        return updateStatus;
    }
    
    public void setUpdateStatus(String updateStatus) {
        this.updateStatus = updateStatus;
    }
    
    public Date getLastUpdateTime() {
        return lastUpdateTime;
    }
    
    public void setLastUpdateTime(Date lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }
    
    public Date getNextUpdateTime() {
        return nextUpdateTime;
    }
    
    public void setNextUpdateTime(Date nextUpdateTime) {
        this.nextUpdateTime = nextUpdateTime;
    }
    
    public Integer getUpdateCount() {
        return updateCount;
    }
    
    public void setUpdateCount(Integer updateCount) {
        this.updateCount = updateCount;
    }
    
    public String getLastUpdateMessage() {
        return lastUpdateMessage;
    }
    
    public void setLastUpdateMessage(String lastUpdateMessage) {
        this.lastUpdateMessage = lastUpdateMessage;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    public Date getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Lifecycle hooks
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
