package com.china.cultural.tourism.dataupdate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
@EnableScheduling
public class DataUpdateServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DataUpdateServiceApplication.class, args);
    }
}