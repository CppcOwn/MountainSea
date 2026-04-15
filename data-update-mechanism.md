# 中国文旅地球仪数据更新机制实现文档

## 1. 概述

本文档详细描述了中国文旅地球仪的数据更新机制实现，包括静态数据（景区基础信息、票价等）的定时更新机制、天气数据的定时推送机制、后台任务调度系统开发，以及数据更新状态监控，确保数据更新的可靠性和一致性。

## 2. 技术架构

### 2.1 服务架构

数据更新机制基于Spring Boot和Spring Cloud微服务架构，主要包含以下组件：

- **data-update-service**：数据更新服务，负责定时更新静态数据和天气数据
- **scenic-service**：景区服务，提供景区基础信息的管理和查询
- **weather-service**：天气服务，提供天气数据的管理和查询
- **Kafka**：消息队列，用于推送天气数据更新
- **MySQL**：关系型数据库，存储任务和数据更新状态信息

### 2.2 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 3.2.x | 微服务框架 |
| Spring Cloud | 2023.x | 微服务生态 |
| Spring Scheduler | - | 定时任务调度 |
| Spring Kafka | - | 消息队列集成 |
| Spring Feign | - | 服务间通信 |
| MySQL | 8.0+ | 数据存储 |
| JUnit 5 | - | 单元测试 |
| Mockito | - | 测试模拟 |

## 3. 功能实现

### 3.1 静态数据更新机制

#### 3.1.1 实现细节

- **定时任务**：使用Spring Scheduler实现每天凌晨0点执行静态数据更新
- **外部数据源**：从外部API获取最新的景区基础信息和票价等静态数据
- **数据更新**：调用scenic-service的API更新景区数据
- **状态监控**：记录数据更新的状态和结果

#### 3.1.2 核心类

- `StaticDataUpdateService`：负责静态数据的更新逻辑
- `DataUpdateScheduler`：定时任务调度器，触发静态数据更新
- `DataUpdateStatusService`：记录数据更新状态

### 3.2 天气数据推送机制

#### 3.2.1 实现细节

- **定时任务**：使用Spring Scheduler实现每30分钟执行天气数据更新
- **数据获取**：从景区服务获取所有景区的ID、纬度和经度
- **天气数据更新**：调用weather-service的API更新天气数据
- **数据推送**：将更新后的天气数据推送到Kafka消息队列
- **状态监控**：记录数据更新的状态和结果

#### 3.2.2 核心类

- `WeatherDataPushService`：负责将天气数据推送到Kafka
- `DataUpdateScheduler`：定时任务调度器，触发天气数据更新
- `DataUpdateStatusService`：记录数据更新状态

### 3.3 后台任务调度系统

#### 3.3.1 实现细节

- **任务管理**：支持任务的创建、查询、更新和删除
- **任务调度**：基于Spring Scheduler实现任务的定时执行
- **任务状态**：记录任务的执行状态、执行时间和执行结果
- **默认任务**：系统启动时初始化默认的静态数据更新和天气数据更新任务

#### 3.3.2 核心类

- `Task`：任务实体类，存储任务信息
- `TaskRepository`：任务数据访问接口
- `TaskService`：任务管理服务
- `TaskController`：任务管理API接口

### 3.4 数据更新状态监控

#### 3.4.1 实现细节

- **状态管理**：记录数据更新的状态（成功、失败、进行中）
- **状态查询**：提供API接口查询数据更新状态
- **状态更新**：在数据更新过程中实时更新状态信息
- **默认状态**：系统启动时初始化默认的数据更新状态

#### 3.4.2 核心类

- `DataUpdateStatus`：数据更新状态实体类，存储状态信息
- `DataUpdateStatusRepository`：数据更新状态数据访问接口
- `DataUpdateStatusService`：数据更新状态管理服务
- `DataUpdateStatusController`：数据更新状态API接口

## 4. API接口

### 4.1 任务管理接口

- `GET /api/tasks`：获取所有任务
- `GET /api/tasks/{id}`：根据ID获取任务
- `POST /api/tasks`：创建任务
- `PUT /api/tasks/{id}`：更新任务
- `DELETE /api/tasks/{id}`：删除任务
- `GET /api/tasks/status/{status}`：根据状态获取任务
- `GET /api/tasks/type/{taskType}`：根据任务类型获取任务

### 4.2 数据更新状态接口

- `GET /api/data-update-statuses`：获取所有数据更新状态
- `GET /api/data-update-statuses/{id}`：根据ID获取数据更新状态
- `GET /api/data-update-statuses/type/{dataType}`：根据数据类型获取数据更新状态
- `POST /api/data-update-statuses`：创建数据更新状态
- `PUT /api/data-update-statuses/{id}`：更新数据更新状态
- `DELETE /api/data-update-statuses/{id}`：删除数据更新状态

## 5. 数据模型

### 5.1 任务模型（Task）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | Long | 任务ID |
| taskName | String | 任务名称 |
| taskType | String | 任务类型（static-data, weather-data） |
| cronExpression | String | Cron表达式 |
| status | String | 任务状态（enabled, disabled） |
| lastExecutionTime | Date | 最后执行时间 |
| nextExecutionTime | Date | 下次执行时间 |
| executionCount | Integer | 执行次数 |
| lastExecutionStatus | String | 最后执行状态（success, failed） |
| lastExecutionMessage | String | 最后执行消息 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

### 5.2 数据更新状态模型（DataUpdateStatus）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | Long | 状态ID |
| dataType | String | 数据类型（static-data, weather-data） |
| updateStatus | String | 更新状态（success, failed, in-progress） |
| lastUpdateTime | Date | 最后更新时间 |
| nextUpdateTime | Date | 下次更新时间 |
| updateCount | Integer | 更新次数 |
| lastUpdateMessage | String | 最后更新消息 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

## 6. 配置说明

### 6.1 定时任务配置

```yaml
# 定时任务配置
schedule:
  static-data:
    cron: "0 0 0 * * ?" # 每天凌晨0点执行
  weather-data:
    cron: "0 */30 * * * ?" # 每30分钟执行一次
```

### 6.2 Kafka配置

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
    consumer:
      group-id: data-update-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
```

## 7. 测试策略

### 7.1 单元测试

- **StaticDataUpdateServiceTest**：测试静态数据更新服务
- **WeatherDataPushServiceTest**：测试天气数据推送服务
- **TaskServiceTest**：测试任务管理服务
- **DataUpdateStatusServiceTest**：测试数据更新状态服务

### 7.2 集成测试

- 测试定时任务的触发和执行
- 测试服务间的通信
- 测试Kafka消息的推送和消费
- 测试数据更新状态的记录和查询

## 8. 部署说明

### 8.1 本地开发环境

1. 启动Kafka服务
2. 启动MySQL服务
3. 启动Eureka服务
4. 启动scenic-service和weather-service
5. 启动data-update-service

### 8.2 生产环境

使用Docker Compose或Kubernetes部署所有服务，确保服务间的通信和依赖关系正确配置。

## 9. 监控与维护

### 9.1 日志管理

- 使用ELK Stack收集和分析日志
- 配置日志级别和输出格式

### 9.2 监控指标

- 使用Prometheus监控系统指标
- 使用Grafana可视化监控数据
- 配置告警规则，及时发现和处理异常

### 9.3 维护建议

- 定期检查数据更新状态
- 监控任务执行情况
- 备份数据库数据
- 定期更新外部数据源的API密钥

## 10. 总结

中国文旅地球仪的数据更新机制通过定时任务调度、消息队列推送和状态监控等技术，实现了静态数据和天气数据的及时更新和推送，确保了数据的可靠性和一致性。同时，后台任务调度系统和数据更新状态监控功能，为系统的运维和管理提供了便利。

该实现采用了微服务架构和现代技术栈，具有良好的可扩展性和可维护性，能够满足中国文旅地球仪的长期发展需求。
