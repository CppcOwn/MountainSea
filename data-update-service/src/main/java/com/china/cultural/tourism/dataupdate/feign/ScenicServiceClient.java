package com.china.cultural.tourism.dataupdate.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import java.util.Map;

@FeignClient(name = "scenic-service")
public interface ScenicServiceClient {
    @GetMapping("/api/scenic-spots")
    List<Map<String, Object>> getAllScenicSpots();
}