package com.china.cultural.tourism.dataupdate.service;

import com.china.cultural.tourism.dataupdate.feign.ScenicServiceClient;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import static org.mockito.Mockito.*;

class StaticDataUpdateServiceTest {
    @Mock
    private ScenicServiceClient scenicServiceClient;
    
    @Mock
    private RestTemplate restTemplate;
    
    @Mock
    private DataUpdateStatusService dataUpdateStatusService;
    
    @InjectMocks
    private StaticDataUpdateService staticDataUpdateService;
    
    public StaticDataUpdateServiceTest() {
        MockitoAnnotations.openMocks(this);
    }
    
    @Test
    void testUpdateStaticData() {
        // 调用更新静态数据方法
        staticDataUpdateService.updateStaticData();
        
        // 验证数据更新状态服务的方法被调用
        verify(dataUpdateStatusService, times(1)).updateDataUpdateStatus("static-data", "in-progress", "开始更新静态数据");
        verify(dataUpdateStatusService, times(1)).updateDataUpdateStatus("static-data", "success", "静态数据更新成功，更新了 0 个景区");
    }
    
    @Test
    void testUpdateStaticDataWithException() {
        // 模拟fetchExternalScenicData方法抛出异常
        try {
            doThrow(new RuntimeException("Test exception")).when(restTemplate).getForObject(anyString(), eq(List.class));
        } catch (Exception e) {
            // 忽略异常
        }
        
        // 调用更新静态数据方法
        staticDataUpdateService.updateStaticData();
        
        // 验证数据更新状态服务的方法被调用
        verify(dataUpdateStatusService, times(1)).updateDataUpdateStatus("static-data", "in-progress", "开始更新静态数据");
        verify(dataUpdateStatusService, times(1)).updateDataUpdateStatus("static-data", "failed", "静态数据更新失败: Test exception");
    }
}
