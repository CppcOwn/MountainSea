package com.china.cultural.tourism.dataupdate.service;

import com.china.cultural.tourism.dataupdate.entity.DataUpdateStatus;
import com.china.cultural.tourism.dataupdate.repository.DataUpdateStatusRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class DataUpdateStatusServiceTest {
    @Mock
    private DataUpdateStatusRepository dataUpdateStatusRepository;
    
    @InjectMocks
    private DataUpdateStatusService dataUpdateStatusService;
    
    public DataUpdateStatusServiceTest() {
        MockitoAnnotations.openMocks(this);
    }
    
    @Test
    void getDataUpdateStatusByDataType() {
        // 创建测试数据更新状态
        DataUpdateStatus status = new DataUpdateStatus();
        status.setId(1L);
        status.setDataType("static-data");
        status.setUpdateStatus("success");
        
        // 模拟dataUpdateStatusRepository.findByDataType方法
        when(dataUpdateStatusRepository.findByDataType("static-data")).thenReturn(Optional.of(status));
        
        // 调用getDataUpdateStatusByDataType方法
        DataUpdateStatus result = dataUpdateStatusService.getDataUpdateStatusByDataType("static-data");
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("static-data", result.getDataType());
        assertEquals("success", result.getUpdateStatus());
    }
    
    @Test
    void updateDataUpdateStatus() {
        // 创建测试数据更新状态
        DataUpdateStatus status = new DataUpdateStatus();
        status.setId(1L);
        status.setDataType("static-data");
        status.setUpdateStatus("idle");
        status.setUpdateCount(0);
        
        // 模拟dataUpdateStatusRepository.findByDataType方法
        when(dataUpdateStatusRepository.findByDataType("static-data")).thenReturn(Optional.of(status));
        
        // 模拟dataUpdateStatusRepository.save方法
        when(dataUpdateStatusRepository.save(status)).thenReturn(status);
        
        // 调用updateDataUpdateStatus方法
        dataUpdateStatusService.updateDataUpdateStatus("static-data", "success", "数据更新成功");
        
        // 验证结果
        assertEquals(1, status.getUpdateCount());
        assertEquals("success", status.getUpdateStatus());
        assertEquals("数据更新成功", status.getLastUpdateMessage());
    }
    
    @Test
    void initDefaultDataUpdateStatuses() {
        // 模拟dataUpdateStatusRepository.findByDataType方法
        when(dataUpdateStatusRepository.findByDataType("static-data")).thenReturn(Optional.empty());
        when(dataUpdateStatusRepository.findByDataType("weather-data")).thenReturn(Optional.empty());
        
        // 调用initDefaultDataUpdateStatuses方法
        dataUpdateStatusService.initDefaultDataUpdateStatuses();
        
        // 验证dataUpdateStatusRepository.save方法被调用了两次
        verify(dataUpdateStatusRepository, times(2)).save(any(DataUpdateStatus.class));
    }
}
