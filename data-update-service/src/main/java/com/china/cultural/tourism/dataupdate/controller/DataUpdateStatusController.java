package com.china.cultural.tourism.dataupdate.controller;

import com.china.cultural.tourism.dataupdate.entity.DataUpdateStatus;
import com.china.cultural.tourism.dataupdate.service.DataUpdateStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/data-update-statuses")
public class DataUpdateStatusController {
    @Autowired
    private DataUpdateStatusService dataUpdateStatusService;
    
    /**
     * 获取所有数据更新状态
     * @return 数据更新状态列表
     */
    @GetMapping
    public ResponseEntity<List<DataUpdateStatus>> getAllDataUpdateStatuses() {
        List<DataUpdateStatus> statuses = dataUpdateStatusService.getAllDataUpdateStatuses();
        return new ResponseEntity<>(statuses, HttpStatus.OK);
    }
    
    /**
     * 根据ID获取数据更新状态
     * @param id 状态ID
     * @return 数据更新状态
     */
    @GetMapping("/{id}")
    public ResponseEntity<DataUpdateStatus> getDataUpdateStatusById(@PathVariable Long id) {
        DataUpdateStatus status = dataUpdateStatusService.getDataUpdateStatusById(id);
        if (status != null) {
            return new ResponseEntity<>(status, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * 根据数据类型获取数据更新状态
     * @param dataType 数据类型
     * @return 数据更新状态
     */
    @GetMapping("/type/{dataType}")
    public ResponseEntity<DataUpdateStatus> getDataUpdateStatusByDataType(@PathVariable String dataType) {
        DataUpdateStatus status = dataUpdateStatusService.getDataUpdateStatusByDataType(dataType);
        if (status != null) {
            return new ResponseEntity<>(status, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * 创建数据更新状态
     * @param status 数据更新状态
     * @return 创建后的状态
     */
    @PostMapping
    public ResponseEntity<DataUpdateStatus> createDataUpdateStatus(@RequestBody DataUpdateStatus status) {
        DataUpdateStatus savedStatus = dataUpdateStatusService.saveDataUpdateStatus(status);
        return new ResponseEntity<>(savedStatus, HttpStatus.CREATED);
    }
    
    /**
     * 更新数据更新状态
     * @param id 状态ID
     * @param status 数据更新状态
     * @return 更新后的状态
     */
    @PutMapping("/{id}")
    public ResponseEntity<DataUpdateStatus> updateDataUpdateStatus(@PathVariable Long id, @RequestBody DataUpdateStatus status) {
        DataUpdateStatus existingStatus = dataUpdateStatusService.getDataUpdateStatusById(id);
        if (existingStatus != null) {
            status.setId(id);
            DataUpdateStatus updatedStatus = dataUpdateStatusService.saveDataUpdateStatus(status);
            return new ResponseEntity<>(updatedStatus, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * 删除数据更新状态
     * @param id 状态ID
     * @return 响应
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDataUpdateStatus(@PathVariable Long id) {
        DataUpdateStatus existingStatus = dataUpdateStatusService.getDataUpdateStatusById(id);
        if (existingStatus != null) {
            dataUpdateStatusService.deleteDataUpdateStatus(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
