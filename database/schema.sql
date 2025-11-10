-- =============================================
-- Cummins 零件仓库管理系统 - 数据库表结构
-- Database: warehouse_test_data (开发) / warehouse_product (生产)
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
CREATE TABLE IF NOT EXISTS inventory (
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
