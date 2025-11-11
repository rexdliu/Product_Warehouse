-- =============================================
-- Cummins 零件仓库管理系统 - 完整数据库设置
-- 包含: 建表语句 + 测试数据
-- Database: warehouse_test_data
-- =============================================

-- =============================================
-- 第一部分: 建表语句
-- =============================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(100),
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff' COMMENT 'staff/manager/admin',
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 产品分类表
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE COMMENT '分类代码',
    description TEXT,
    parent_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类表';

-- 3. 产品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    part_number VARCHAR(100) UNIQUE COMMENT 'Cummins 零件号',
    engine_model VARCHAR(50) COMMENT '适用发动机型号',
    manufacturer VARCHAR(100) DEFAULT 'Cummins',
    description TEXT,
    category_id INT,
    price DECIMAL(12, 2) NOT NULL,
    cost DECIMAL(12, 2),
    unit VARCHAR(20) DEFAULT 'pcs' COMMENT '单位: pcs/box/liter',
    min_stock_level INT DEFAULT 10 COMMENT '最低库存预警线',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_sku (sku),
    INDEX idx_part_number (part_number),
    INDEX idx_engine_model (engine_model),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

-- 4. 仓库表
CREATE TABLE IF NOT EXISTS warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE COMMENT '仓库代码',
    location VARCHAR(255),
    capacity DECIMAL(12, 2) COMMENT '容量（立方米）',
    current_usage DECIMAL(12, 2) DEFAULT 0.0 COMMENT '当前使用量',
    manager_name VARCHAR(100) COMMENT '仓库管理员',
    phone VARCHAR(20) COMMENT '联系电话',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库表';

-- 5. 库存表
CREATE TABLE IF NOT EXISTS inventories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0 COMMENT '预留数量',
    location_code VARCHAR(50) COMMENT '货位编号',
    last_counted_at TIMESTAMP NULL COMMENT '最后盘点时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_warehouse (product_id, warehouse_id),
    INDEX idx_quantity (quantity),
    INDEX idx_location (location_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存表';

-- 6. 库存交易记录表
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL COMMENT 'IN/OUT/ADJUST/TRANSFER',
    quantity INT NOT NULL COMMENT '数量（正数为入库，负数为出库）',
    user_id INT COMMENT '操作用户',
    reference VARCHAR(100) COMMENT '关联单据号',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_product (product_id),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_type (transaction_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存交易记录表';

-- 7. 经销商表
CREATE TABLE IF NOT EXISTS distributors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE COMMENT '经销商代码',
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    region VARCHAR(100) COMMENT '所属区域',
    credit_limit DECIMAL(12, 2) DEFAULT 0.0 COMMENT '信用额度',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_code (code),
    INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经销商表';

-- 8. 销售订单表
CREATE TABLE IF NOT EXISTS sales_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    distributor_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_value DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/processing/shipped/completed/cancelled',
    warehouse_id INT COMMENT '出货仓库',
    delivery_date TIMESTAMP NULL COMMENT '计划交货日期',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    user_id INT COMMENT '创建订单的用户',
    notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_code (order_code),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_distributor (distributor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售订单表';

-- 9. 活动日志表
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_type VARCHAR(20) NOT NULL COMMENT 'inventory/order/product/alert',
    action VARCHAR(100) NOT NULL COMMENT '操作动作',
    item_name VARCHAR(200) NOT NULL COMMENT '项目名称',
    user_id INT,
    reference_id INT COMMENT '关联记录ID',
    reference_type VARCHAR(50) COMMENT '关联记录类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动日志表';

-- =============================================
-- 第二部分: 清空现有数据
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE inventory_transactions;
TRUNCATE TABLE sales_orders;
TRUNCATE TABLE distributors;
TRUNCATE TABLE inventories;
TRUNCATE TABLE warehouses;
TRUNCATE TABLE products;
TRUNCATE TABLE product_categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 第三部分: 插入测试数据
-- =============================================

-- 1. 插入用户数据
-- 密码: admin123, manager123, staff123
INSERT INTO users (username, email, phone, full_name, hashed_password, role, is_superuser) VALUES
('admin', 'admin@warehouse.com', '13800138000', '系统管理员', '$2b$12$iHFJxjm8P8uJDyRn9bhJIOOtb/3rxZPiStyQ9crREhC14xHEQV94q', 'admin', TRUE),
('manager', 'manager@warehouse.com', '13800138001', '仓库经理', '$2b$12$dIMLWxtI1Q7SwlaXATnNHustGNkrJQRz/5DP3oZ9BEKPmTWkoriN2', 'manager', FALSE),
('staff', 'staff@warehouse.com', '13800138002', '仓库员工', '$2b$12$ujCph6NyyPX8E/cemoA6hugnJOLarI4QwCrYkXuMmHgm6MNfbHMHG', 'staff', FALSE),
('rextest', 'rex@test.com', '13900001111', 'Rex 测试账号', '$2b$12$fnVPPQVGketfmYBlHkT1z.coivQhDbZ1QeqJqQEX.UZHg.lkmaLbq', 'admin', TRUE);

-- 2. 插入产品分类
INSERT INTO product_categories (name, code, description) VALUES
('发动机', 'ENGINE', 'Cummins 发动机整机'),
('零配件', 'PARTS', '发动机零配件'),
('机油', 'OIL', '润滑油和机油'),
('滤芯', 'FILTER', '各类滤芯'),
('传感器', 'SENSOR', '各类传感器');

-- 3. 插入产品数据
INSERT INTO products (name, sku, part_number, engine_model, description, category_id, price, cost, unit, min_stock_level) VALUES
-- 发动机
('Cummins 6BT5.9 发动机总成', 'ENG-6BT59-001', '6BT5.9-C120', '6BT5.9', 'Cummins 6BT5.9 柴油发动机总成，120马力', 1, 45000.00, 38000.00, '台', 5),
('Cummins ISF2.8 发动机总成', 'ENG-ISF28-001', 'ISF2.8-C107', 'ISF2.8', 'Cummins ISF2.8 柴油发动机总成，107马力', 1, 38000.00, 32000.00, '台', 5),

-- 零配件
('喷油器总成', 'PART-INJ-001', '4937065', '6BT5.9', '6BT5.9 喷油器总成', 2, 1200.00, 950.00, '件', 20),
('活塞组件', 'PART-PIS-001', '3802657', 'ISF2.8', 'ISF2.8 活塞组件（含活塞环）', 2, 580.00, 450.00, '套', 15),
('涡轮增压器', 'PART-TUR-001', '4955152', '6BT5.9', '6BT5.9 涡轮增压器', 2, 3500.00, 2800.00, '件', 10),

-- 机油
('Cummins 专用机油 15W-40', 'OIL-15W40-001', 'CES20081', '通用', 'Cummins 认证柴油机机油 15W-40', 3, 280.00, 220.00, '桶', 50),
('Cummins 专用机油 10W-30', 'OIL-10W30-001', 'CES20086', '通用', 'Cummins 认证柴油机机油 10W-30', 3, 300.00, 240.00, '桶', 40),

-- 滤芯
('机油滤清器', 'FIL-OIL-001', 'LF9009', '6BT5.9', '6BT5.9 机油滤清器', 4, 85.00, 60.00, '件', 100),
('燃油滤清器', 'FIL-FUEL-001', 'FF5320', 'ISF2.8', 'ISF2.8 燃油滤清器', 4, 95.00, 70.00, '件', 100),
('空气滤清器', 'FIL-AIR-001', 'AF25558', '通用', '空气滤清器外滤芯', 4, 120.00, 90.00, '件', 80),

-- 传感器
('水温传感器', 'SEN-TEMP-001', '4921477', '6BT5.9', '6BT5.9 水温传感器', 5, 150.00, 110.00, '件', 30),
('机油压力传感器', 'SEN-PRES-001', '4921322', 'ISF2.8', 'ISF2.8 机油压力传感器', 5, 180.00, 140.00, '件', 30);

-- 4. 插入仓库数据
INSERT INTO warehouses (name, code, location, capacity, current_usage, manager_name, phone) VALUES
('成都主仓库', 'WH001', '四川省成都市新都区', 5000.0, 2800.0, '张三', '13900000001'),
('重庆分仓库', 'WH002', '重庆市北碚区', 3000.0, 1500.0, '李四', '13900000002'),
('昆明分仓库', 'WH003', '云南省昆明市官渡区', 2000.0, 800.0, '王五', '13900000003');

-- 5. 插入库存数据
INSERT INTO inventories (product_id, warehouse_id, quantity, reserved_quantity, location_code) VALUES
-- 产品 1-2: 发动机
(1, 1, 25, 2, 'A-05-10'),
(1, 2, 15, 1, 'A-03-05'),
(1, 3, 8, 0, 'A-02-03'),
(2, 1, 30, 3, 'A-05-12'),
(2, 2, 20, 2, 'A-03-07'),
(2, 3, 12, 1, 'A-02-05'),

-- 产品 3-5: 零配件
(3, 1, 85, 5, 'B-10-15'),
(3, 2, 60, 3, 'B-08-12'),
(3, 3, 45, 2, 'B-05-08'),
(4, 1, 120, 8, 'B-12-20'),
(4, 2, 80, 5, 'B-09-15'),
(4, 3, 55, 3, 'B-06-10'),
(5, 1, 35, 2, 'B-08-18'),
(5, 2, 25, 2, 'B-06-14'),
(5, 3, 15, 1, 'B-04-09'),

-- 产品 6-7: 机油
(6, 1, 250, 15, 'C-15-25'),
(6, 2, 180, 10, 'C-12-20'),
(6, 3, 120, 8, 'C-08-15'),
(7, 1, 200, 12, 'C-15-28'),
(7, 2, 150, 8, 'C-12-22'),
(7, 3, 100, 5, 'C-08-18'),

-- 产品 8-10: 滤芯
(8, 1, 450, 25, 'D-20-30'),
(8, 2, 350, 18, 'D-18-25'),
(8, 3, 280, 12, 'D-15-20'),
(9, 1, 380, 20, 'D-20-32'),
(9, 2, 95, 5, 'D-18-28'),
(9, 3, 8, 0, 'D-15-22'),
(10, 1, 320, 18, 'D-22-35'),
(10, 2, 75, 4, 'D-19-30'),
(10, 3, 0, 0, 'D-16-25'),

-- 产品 11-12: 传感器
(11, 1, 125, 8, 'E-10-15'),
(11, 2, 90, 5, 'E-08-12'),
(11, 3, 65, 3, 'E-06-10'),
(12, 1, 110, 6, 'E-10-18'),
(12, 2, 85, 4, 'E-08-15'),
(12, 3, 60, 2, 'E-06-12');

-- 6. 插入经销商数据
INSERT INTO distributors (name, code, contact_person, phone, email, address, region, credit_limit) VALUES
('成都康明斯专卖店', 'DIST001', '赵六', '028-88888888', 'zhao@cdcummins.com', '四川省成都市武侯区人民南路123号', '四川', 500000.0),
('重庆康明斯经销商', 'DIST002', '钱七', '023-66666666', 'qian@cqcummins.com', '重庆市渝北区金渝大道456号', '重庆', 300000.0),
('云南康明斯代理', 'DIST003', '孙八', '0871-77777777', 'sun@yncummins.com', '云南省昆明市盘龙区北京路789号', '云南', 200000.0),
('贵州康明斯销售中心', 'DIST004', '周九', '0851-99999999', 'zhou@gzcummins.com', '贵州省贵阳市南明区中华南路321号', '贵州', 150000.0);

-- 7. 插入销售订单数据
INSERT INTO sales_orders (order_code, distributor_id, product_id, product_name, quantity, unit_price, total_value, status, warehouse_id, delivery_date, user_id, notes, order_date) VALUES
-- 已完成的订单
('SO202411011001', 1, 1, 'Cummins 6BT5.9 发动机总成', 2, 45000.00, 90000.00, 'completed', 1, '2024-11-05 00:00:00', 1, '常规订单', '2024-10-25 09:30:00'),
('SO202411021002', 2, 6, 'Cummins 专用机油 15W-40', 50, 280.00, 14000.00, 'completed', 2, '2024-11-06 00:00:00', 2, '批量采购', '2024-10-28 14:20:00'),
('SO202411031003', 3, 8, '机油滤清器', 100, 85.00, 8500.00, 'completed', 3, '2024-11-08 00:00:00', 2, '定期补货', '2024-10-30 10:15:00'),

-- 已发货的订单
('SO202411041004', 1, 3, '喷油器总成', 10, 1200.00, 12000.00, 'shipped', 1, '2024-11-10 00:00:00', 1, '紧急订单', '2024-11-02 16:45:00'),
('SO202411051005', 4, 5, '涡轮增压器', 5, 3500.00, 17500.00, 'shipped', 1, '2024-11-11 00:00:00', 2, '维修更换', '2024-11-03 11:20:00'),

-- 处理中的订单
('SO202411061006', 2, 2, 'Cummins ISF2.8 发动机总成', 3, 38000.00, 114000.00, 'processing', 2, '2024-11-15 00:00:00', 1, '新客户订单', '2024-11-05 09:00:00'),
('SO202411071007', 3, 7, 'Cummins 专用机油 10W-30', 30, 300.00, 9000.00, 'processing', 3, '2024-11-13 00:00:00', 2, '月度订单', '2024-11-06 14:30:00'),

-- 待处理的订单
('SO202411081008', 1, 9, '燃油滤清器', 80, 95.00, 7600.00, 'pending', 1, '2024-11-18 00:00:00', 1, '补货订单', '2024-11-07 10:20:00'),
('SO202411091009', 4, 10, '空气滤清器', 60, 120.00, 7200.00, 'pending', 2, '2024-11-20 00:00:00', 2, '常规补货', '2024-11-08 15:45:00'),
('SO202411101010', 2, 11, '水温传感器', 25, 150.00, 3750.00, 'pending', 2, '2024-11-22 00:00:00', 1, '零配件订单', '2024-11-09 09:15:00');

-- 8. 插入库存交易记录
INSERT INTO inventory_transactions (product_id, warehouse_id, transaction_type, quantity, user_id, reference, notes, created_at) VALUES
-- 入库记录
(1, 1, 'IN', 10, 1, 'PO-20241101-001', '发动机入库', '2024-11-01 09:00:00'),
(6, 1, 'IN', 100, 2, 'PO-20241101-002', '机油批量入库', '2024-11-01 10:30:00'),
(8, 2, 'IN', 150, 2, 'PO-20241102-001', '滤芯补货入库', '2024-11-02 14:00:00'),

-- 出库记录（对应订单）
(1, 1, 'OUT', -2, 1, 'SO202411011001', '订单出库', '2024-11-04 10:00:00'),
(6, 2, 'OUT', -50, 2, 'SO202411021002', '订单出库', '2024-11-05 11:00:00'),
(8, 3, 'OUT', -100, 2, 'SO202411031003', '订单出库', '2024-11-07 09:30:00'),

-- 调整记录
(9, 3, 'ADJUST', -5, 1, 'ADJ-20241105-001', '盘点调整 - 发现损坏', '2024-11-05 16:00:00'),
(10, 2, 'ADJUST', 10, 2, 'ADJ-20241106-001', '盘点调整 - 账实差异', '2024-11-06 15:30:00'),

-- 调拨记录
(7, 1, 'TRANSFER', -20, 1, 'TRF-20241107-001', '从成都调拨至重庆', '2024-11-07 10:00:00'),
(7, 2, 'TRANSFER', 20, 1, 'TRF-20241107-001', '从成都调拨至重庆', '2024-11-07 11:00:00');

-- 9. 插入活动日志
INSERT INTO activity_logs (activity_type, action, item_name, user_id, reference_id, reference_type, created_at) VALUES
-- 订单活动
('order', '创建订单', '订单 SO202411101010', 1, 10, 'order', '2024-11-09 09:15:00'),
('order', '订单完成', '订单 SO202411011001', 1, 1, 'order', '2024-11-05 10:00:00'),
('order', '订单发货', '订单 SO202411041004', 1, 4, 'order', '2024-11-09 08:30:00'),

-- 库存活动
('inventory', '入库', 'Cummins 6BT5.9 发动机总成', 1, 1, 'product', '2024-11-01 09:00:00'),
('inventory', '出库', 'Cummins 专用机油 15W-40', 2, 6, 'product', '2024-11-05 11:00:00'),
('inventory', '盘点调整', '燃油滤清器', 1, 9, 'product', '2024-11-05 16:00:00'),

-- 产品活动
('product', '更新产品', 'Cummins ISF2.8 发动机总成', 1, 2, 'product', '2024-11-03 14:20:00'),
('product', '更新产品', '机油滤清器', 2, 8, 'product', '2024-11-04 10:15:00'),

-- 警报活动
('alert', '低库存警报', '燃油滤清器 - 昆明分仓库', 1, 9, 'product', '2024-11-08 08:00:00'),
('alert', '缺货警报', '空气滤清器 - 昆明分仓库', 1, 10, 'product', '2024-11-09 08:00:00');

--*
ALTER TABLE products ADD COLUMN image_url VARCHAR(255)
--
-- =============================================
-- 完成提示
-- =============================================
SELECT '数据库初始化完成！' as 状态;
SELECT '可用测试账号:' as 提示;
SELECT 'admin/admin123 (管理员)' as 账号1;
SELECT 'manager/manager123 (仓库经理)' as 账号2;
SELECT 'staff/staff123 (员工)' as 账号3;
SELECT 'rextest/admin123 (测试)' as 账号4;
