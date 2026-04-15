package com.china.cultural.tourism.dataupdate.controller;

import com.china.cultural.tourism.dataupdate.entity.Task;
import com.china.cultural.tourism.dataupdate.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;
    
    /**
     * 获取所有任务
     * @return 任务列表
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }
    
    /**
     * 根据ID获取任务
     * @param id 任务ID
     * @return 任务
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        if (task != null) {
            return new ResponseEntity<>(task, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * 创建任务
     * @param task 任务
     * @return 创建后的任务
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task savedTask = taskService.saveTask(task);
        return new ResponseEntity<>(savedTask, HttpStatus.CREATED);
    }
    
    /**
     * 更新任务
     * @param id 任务ID
     * @param task 任务
     * @return 更新后的任务
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        Task existingTask = taskService.getTaskById(id);
        if (existingTask != null) {
            task.setId(id);
            Task updatedTask = taskService.saveTask(task);
            return new ResponseEntity<>(updatedTask, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * 删除任务
     * @param id 任务ID
     * @return 响应
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        Task existingTask = taskService.getTaskById(id);
        if (existingTask != null) {
            taskService.deleteTask(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * 根据状态获取任务
     * @param status 任务状态
     * @return 任务列表
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable String status) {
        List<Task> tasks = taskService.getTasksByStatus(status);
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }
    
    /**
     * 根据任务类型获取任务
     * @param taskType 任务类型
     * @return 任务列表
     */
    @GetMapping("/type/{taskType}")
    public ResponseEntity<List<Task>> getTasksByType(@PathVariable String taskType) {
        List<Task> tasks = taskService.getTasksByType(taskType);
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }
}
