package com.china.cultural.tourism.dataupdate.service;

import com.china.cultural.tourism.dataupdate.entity.DataUpdateStatus;
import com.china.cultural.tourism.dataupdate.repository.DataUpdateStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DataUpdateStatusService {
    @Autowired
    private DataUpdateStatusRepository dataUpdateStatusRepository;
    
    /**
     * 获取所有数据更新状态
     * @return 数据更新状态列表
     */
    public List<DataUpdateStatus> getAllDataUpdateStatuses() {
        return dataUpdateStatusRepository.findAll();
    }
    
    /**
     * 根据ID获取数据更新状态
     * @param id 状态ID
     * @return 数据更新状态
     */
    public DataUpdateStatus getDataUpdateStatusById(Long id) {
        return dataUpdateStatusRepository.findById(id).orElse(null);
    }
    
    /**
     * 根据数据类型获取数据更新状态
     * @param dataType 数据类型
     * @return 数据更新状态
     */
    public DataUpdateStatus getDataUpdateStatusByDataType(String dataType) {
        return dataUpdateStatusRepository.findByDataType(dataType).orElse(null);
    }
    
    /**
     * 保存数据更新状态
     * @param dataUpdateStatus 数据更新状态
     * @return 保存后的状态
     */
    public DataUpdateStatus saveDataUpdateStatus(DataUpdateStatus dataUpdateStatus) {
        return dataUpdateStatusRepository.save(dataUpdateStatus);
    }
    
    /**
     * 删除数据更新状态
     * @param id 状态ID
     */
    public void deleteDataUpdateStatus(Long id) {
        dataUpdateStatusRepository.deleteById(id);
    }
    
    /**
     * 更新数据更新状态
     * @param dataType 数据类型
     * @param status 更新状态
     * @param message 更新消息
     */
    public void updateDataUpdateStatus(String dataType, String status, String message) {
        DataUpdateStatus dataUpdateStatus = getDataUpdateStatusByDataType(dataType);
        if (dataUpdateStatus == null) {
            // 如果不存在，创建新的状态记录
            dataUpdateStatus = new DataUpdateStatus();
            dataUpdateStatus.setDataType(dataType);
            dataUpdateStatus.setUpdateCount(0);
        }
        
        dataUpdateStatus.setUpdateStatus(status);
        dataUpdateStatus.setLastUpdateTime(new Date());
        dataUpdateStatus.setLastUpdateMessage(message);
        dataUpdateStatus.setUpdateCount(dataUpdateStatus.getUpdateCount() + 1);
        
        dataUpdateStatusRepository.save(dataUpdateStatus);
    }
    
    /**
     * 初始化默认数据更新状态
     */
    public void initDefaultDataUpdateStatuses() {
        // 检查是否已有静态数据更新状态
        if (getDataUpdateStatusByDataType("static-data") == null) {
            DataUpdateStatus staticDataStatus = new DataUpdateStatus();
            staticDataStatus.setDataType("static-data");
            staticDataStatus.setUpdateStatus("idle");
            dataUpdateStatusRepository.save(staticDataStatus);
        }
        
        // 检查是否已有天气数据更新状态
        if (getDataUpdateStatusByDataType("weather-data") == null) {
            DataUpdateStatus weatherDataStatus = new DataUpdateStatus();
            weatherDataStatus.setDataType("weather-data");
            weatherDataStatus.setUpdateStatus("idle");
            dataUpdateStatusRepository.save(weatherDataStatus);
        }
    }
}
