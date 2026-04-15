package com.china.cultural.tourism.dataupdate.service;

import com.china.cultural.tourism.dataupdate.entity.Task;
import com.china.cultural.tourism.dataupdate.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;
    
    /**
     * 获取所有任务
     * @return 任务列表
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    
    /**
     * 根据ID获取任务
     * @param id 任务ID
     * @return 任务
     */
    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }
    
    /**
     * 保存任务
     * @param task 任务
     * @return 保存后的任务
     */
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }
    
    /**
     * 删除任务
     * @param id 任务ID
     */
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
    
    /**
     * 根据状态获取任务
     * @param status 任务状态
     * @return 任务列表
     */
    public List<Task> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status);
    }
    
    /**
     * 根据任务类型获取任务
     * @param taskType 任务类型
     * @return 任务列表
     */
    public List<Task> getTasksByType(String taskType) {
        return taskRepository.findByTaskType(taskType);
    }
    
    /**
     * 更新任务执行状态
     * @param taskId 任务ID
     * @param status 执行状态
     * @param message 执行消息
     */
    public void updateTaskExecutionStatus(Long taskId, String status, String message) {
        Task task = getTaskById(taskId);
        if (task != null) {
            task.setLastExecutionTime(new Date());
            task.setLastExecutionStatus(status);
            task.setLastExecutionMessage(message);
            task.setExecutionCount(task.getExecutionCount() + 1);
            taskRepository.save(task);
        }
    }
    
    /**
     * 初始化默认任务
     */
    public void initDefaultTasks() {
        // 检查是否已有任务
        if (taskRepository.count() == 0) {
            // 创建静态数据更新任务
            Task staticDataTask = new Task();
            staticDataTask.setTaskName("静态数据更新任务");
            staticDataTask.setTaskType("static-data");
            staticDataTask.setCronExpression("0 0 0 * * ?"); // 每天凌晨0点执行
            staticDataTask.setStatus("enabled");
            taskRepository.save(staticDataTask);
            
            // 创建天气数据更新任务
            Task weatherDataTask = new Task();
            weatherDataTask.setTaskName("天气数据更新任务");
            weatherDataTask.setTaskType("weather-data");
            weatherDataTask.setCronExpression("0 */30 * * * ?"); // 每30分钟执行一次
            weatherDataTask.setStatus("enabled");
            taskRepository.save(weatherDataTask);
        }
    }
}
