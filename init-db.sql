-- 创建数据库
CREATE DATABASE IF NOT EXISTS china_cultural_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE china_cultural_tourism;

-- 创建景区等级表
CREATE TABLE IF NOT EXISTS scenic_level (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(10) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建地区表
CREATE TABLE IF NOT EXISTS region (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL,
    level VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建景区基础信息表
CREATE TABLE IF NOT EXISTS scenic_spot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    address VARCHAR(255),
    official_website VARCHAR(255),
    level_id BIGINT,
    region_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (level_id) REFERENCES scenic_level(id),
    FOREIGN KEY (region_id) REFERENCES region(id),
    INDEX idx_level_id (level_id),
    INDEX idx_region_id (region_id),
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建景区图片表
CREATE TABLE IF NOT EXISTS scenic_image (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    scenic_spot_id BIGINT NOT NULL,
    url VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spot(id) ON DELETE CASCADE,
    INDEX idx_scenic_spot_id (scenic_spot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建景区票价表
CREATE TABLE IF NOT EXISTS scenic_ticket (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    scenic_spot_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DOUBLE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spot(id) ON DELETE CASCADE,
    INDEX idx_scenic_spot_id (scenic_spot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建天气数据表
CREATE TABLE IF NOT EXISTS weather_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    scenic_spot_id BIGINT NOT NULL,
    temperature DOUBLE,
    weather_condition VARCHAR(100),
    wind_direction VARCHAR(50),
    wind_speed DOUBLE,
    humidity INT,
    clothing_recommendation VARCHAR(255),
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scenic_spot_id) REFERENCES scenic_spot(id),
    INDEX idx_scenic_spot_id (scenic_spot_id),
    INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入景区等级数据
INSERT INTO scenic_level (name, description) VALUES
('5A', '国家5A级旅游景区'),
('4A', '国家4A级旅游景区'),
('3A', '国家3A级旅游景区')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 插入地区数据（示例）
INSERT INTO region (name, code, level) VALUES
('北京市', '110000', '省'),
('上海市', '310000', '省'),
('广东省', '440000', '省'),
('浙江省', '330000', '省'),
('江苏省', '320000', '省')
ON DUPLICATE KEY UPDATE name = VALUES(name), level = VALUES(level);

-- 插入示例景区数据
INSERT INTO scenic_spot (name, description, latitude, longitude, address, official_website, level_id, region_id) VALUES
('故宫博物院', '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。', 39.9163, 116.3972, '北京市东城区景山前街4号', 'https://www.dpm.org.cn/', 1, 1),
('长城', '中国古代的军事防御工程，是世界文化遗产。', 40.4319, 116.5704, '北京市怀柔区', 'https://www.badaling.gov.cn/', 1, 1),
('黄山', '以奇松、怪石、云海、温泉、冬雪"五绝"著称于世。', 30.1333, 118.1667, '安徽省黄山市黄山区汤口镇', 'https://www.huangshan.gov.cn/', 1, 3),
('西湖', '中国古典园林代表作，世界文化遗产。', 30.2428, 120.1486, '浙江省杭州市西湖区', 'https://www.hangzhou.com.cn/', 1, 4),
('苏州园林', '中国古典园林的杰出代表，世界文化遗产。', 31.2989, 120.5853, '江苏省苏州市姑苏区', 'https://www.szyl.com/', 1, 5)
ON DUPLICATE KEY UPDATE description = VALUES(description), address = VALUES(address), official_website = VALUES(official_website);

-- 插入示例景区图片数据
INSERT INTO scenic_image (scenic_spot_id, url, description, order_index) VALUES
(1, 'https://example.com/images/forbidden-city-1.jpg', '故宫全景', 1),
(1, 'https://example.com/images/forbidden-city-2.jpg', '太和殿', 2),
(2, 'https://example.com/images/great-wall-1.jpg', '长城全景', 1),
(2, 'https://example.com/images/great-wall-2.jpg', '长城烽火台', 2),
(3, 'https://example.com/images/huangshan-1.jpg', '黄山云海', 1),
(3, 'https://example.com/images/huangshan-2.jpg', '黄山迎客松', 2),
(4, 'https://example.com/images/west-lake-1.jpg', '西湖全景', 1),
(4, 'https://example.com/images/west-lake-2.jpg', '断桥残雪', 2),
(5, 'https://example.com/images/suzhou-garden-1.jpg', '拙政园', 1),
(5, 'https://example.com/images/suzhou-garden-2.jpg', '留园', 2);

-- 插入示例景区票价数据
INSERT INTO scenic_ticket (scenic_spot_id, type, price, description) VALUES
(1, '成人票', 60.0, '旺季价格'),
(1, '学生票', 30.0, '凭学生证购买'),
(2, '成人票', 40.0, '八达岭长城'),
(2, '学生票', 20.0, '凭学生证购买'),
(3, '成人票', 230.0, '旺季价格'),
(3, '学生票', 115.0, '凭学生证购买'),
(4, '免费', 0.0, '西湖景区免费开放'),
(5, '成人票', 70.0, '拙政园'),
(5, '学生票', 35.0, '凭学生证购买');
