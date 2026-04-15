package com.china.cultural.tourism.dataupdate.repository;

import com.china.cultural.tourism.dataupdate.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(String status);
    List<Task> findByTaskType(String taskType);
}
