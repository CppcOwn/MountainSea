package com.china.cultural.tourism.dataupdate.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "task")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "task_name", nullable = false)
    private String taskName;
    
    @Column(name = "task_type", nullable = false)
    private String taskType; // static-data, weather-data
    
    @Column(name = "cron_expression", nullable = false)
    private String cronExpression;
    
    @Column(name = "status", nullable = false)
    private String status; // enabled, disabled
    
    @Column(name = "last_execution_time")
    private Date lastExecutionTime;
    
    @Column(name = "next_execution_time")
    private Date nextExecutionTime;
    
    @Column(name = "execution_count")
    private Integer executionCount = 0;
    
    @Column(name = "last_execution_status")
    private String lastExecutionStatus; // success, failed
    
    @Column(name = "last_execution_message")
    private String lastExecutionMessage;
    
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
    
    public String getTaskName() {
        return taskName;
    }
    
    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }
    
    public String getTaskType() {
        return taskType;
    }
    
    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }
    
    public String getCronExpression() {
        return cronExpression;
    }
    
    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Date getLastExecutionTime() {
        return lastExecutionTime;
    }
    
    public void setLastExecutionTime(Date lastExecutionTime) {
        this.lastExecutionTime = lastExecutionTime;
    }
    
    public Date getNextExecutionTime() {
        return nextExecutionTime;
    }
    
    public void setNextExecutionTime(Date nextExecutionTime) {
        this.nextExecutionTime = nextExecutionTime;
    }
    
    public Integer getExecutionCount() {
        return executionCount;
    }
    
    public void setExecutionCount(Integer executionCount) {
        this.executionCount = executionCount;
    }
    
    public String getLastExecutionStatus() {
        return lastExecutionStatus;
    }
    
    public void setLastExecutionStatus(String lastExecutionStatus) {
        this.lastExecutionStatus = lastExecutionStatus;
    }
    
    public String getLastExecutionMessage() {
        return lastExecutionMessage;
    }
    
    public void setLastExecutionMessage(String lastExecutionMessage) {
        this.lastExecutionMessage = lastExecutionMessage;
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
