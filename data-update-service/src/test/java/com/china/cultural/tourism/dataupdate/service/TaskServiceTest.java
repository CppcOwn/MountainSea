package com.china.cultural.tourism.dataupdate.service;

import com.china.cultural.tourism.dataupdate.entity.Task;
import com.china.cultural.tourism.dataupdate.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class TaskServiceTest {
    @Mock
    private TaskRepository taskRepository;
    
    @InjectMocks
    private TaskService taskService;
    
    public TaskServiceTest() {
        MockitoAnnotations.openMocks(this);
    }
    
    @Test
    void testGetTaskById() {
        // 创建测试任务
        Task task = new Task();
        task.setId(1L);
        task.setTaskName("测试任务");
        task.setTaskType("static-data");
        task.setCronExpression("0 0 0 * * ?");
        task.setStatus("enabled");
        
        // 模拟taskRepository.findById方法
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        
        // 调用getTaskById方法
        Task result = taskService.getTaskById(1L);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("测试任务", result.getTaskName());
    }
    
    @Test
    void testSaveTask() {
        // 创建测试任务
        Task task = new Task();
        task.setTaskName("测试任务");
        task.setTaskType("static-data");
        task.setCronExpression("0 0 0 * * ?");
        task.setStatus("enabled");
        
        // 模拟taskRepository.save方法
        when(taskRepository.save(task)).thenReturn(task);
        
        // 调用saveTask方法
        Task result = taskService.saveTask(task);
        
        // 验证结果
        assertNotNull(result);
        assertEquals("测试任务", result.getTaskName());
    }
    
    @Test
    void testUpdateTaskExecutionStatus() {
        // 创建测试任务
        Task task = new Task();
        task.setId(1L);
        task.setTaskName("测试任务");
        task.setTaskType("static-data");
        task.setCronExpression("0 0 0 * * ?");
        task.setStatus("enabled");
        task.setExecutionCount(0);
        
        // 模拟taskRepository.findById方法
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        
        // 模拟taskRepository.save方法
        when(taskRepository.save(task)).thenReturn(task);
        
        // 调用updateTaskExecutionStatus方法
        taskService.updateTaskExecutionStatus(1L, "success", "任务执行成功");
        
        // 验证结果
        assertEquals(1, task.getExecutionCount());
        assertEquals("success", task.getLastExecutionStatus());
        assertEquals("任务执行成功", task.getLastExecutionMessage());
    }
    
    @Test
    void testInitDefaultTasks() {
        // 模拟taskRepository.count方法
        when(taskRepository.count()).thenReturn(0L);
        
        // 调用initDefaultTasks方法
        taskService.initDefaultTasks();
        
        // 验证taskRepository.save方法被调用了两次
        verify(taskRepository, times(2)).save(any(Task.class));
    }
}
