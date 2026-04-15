package com.china.cultural.tourism.dataupdate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.china.cultural.tourism.dataupdate.service.TaskService;
import com.china.cultural.tourism.dataupdate.service.DataUpdateStatusService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
@EnableScheduling
public class DataUpdateServiceApplication {
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private DataUpdateStatusService dataUpdateStatusService;
    
    public static void main(String[] args) {
        SpringApplication.run(DataUpdateServiceApplication.class, args);
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
    
    @PostConstruct
    public void init() {
        // 初始化默认任务
        taskService.initDefaultTasks();
        
        // 初始化默认数据更新状态
        dataUpdateStatusService.initDefaultDataUpdateStatuses();
    }
}