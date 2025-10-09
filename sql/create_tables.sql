-- Product Warehouse database schema
-- Generated according to 数据库规范.md and 数据规范.md
-- Compatible with MySQL 8.0+ / AWS RDS MySQL

-- Ensure correct database is selected before running this script, e.g.:
--   USE `product_warehouse`;

CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(32) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    is_superuser    TINYINT(1) NOT NULL DEFAULT 0,
    created_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
    theme           VARCHAR(50) NOT NULL DEFAULT 'system',
    notifications   JSON NOT NULL DEFAULT (JSON_OBJECT()),
    ai_settings     JSON NOT NULL DEFAULT (JSON_OBJECT()),
    avatar_url      VARCHAR(512) NULL,
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_phone UNIQUE (phone),
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT NULL,
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_product_categories_name UNIQUE (name),
    INDEX idx_product_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    sku          VARCHAR(100) NOT NULL,
    description  TEXT NULL,
    price        DECIMAL(12,2) NOT NULL,
    cost         DECIMAL(12,2) NULL,
    category_id  INT UNSIGNED NULL,
    image_url    VARCHAR(512) NULL,
    is_active    TINYINT(1) NOT NULL DEFAULT 1,
    created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_products_sku UNIQUE (sku),
    INDEX idx_products_name (name),
    INDEX idx_products_category (category_id),
    CONSTRAINT fk_products_category_id_product_categories FOREIGN KEY (category_id)
        REFERENCES product_categories(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS warehouses (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    location   VARCHAR(255) NULL,
    capacity   DECIMAL(12,2) NULL,
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_warehouses_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventories (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id         INT UNSIGNED NOT NULL,
    warehouse_id       INT UNSIGNED NOT NULL,
    quantity           INT NOT NULL DEFAULT 0,
    reserved_quantity  INT NOT NULL DEFAULT 0,
    available_quantity INT AS (quantity - reserved_quantity) STORED,
    updated_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_inventories_product_warehouse UNIQUE (product_id, warehouse_id),
    INDEX idx_inventories_product (product_id),
    INDEX idx_inventories_warehouse (warehouse_id),
    CONSTRAINT fk_inventories_product_id_products FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_inventories_warehouse_id_warehouses FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id       INT UNSIGNED NOT NULL,
    warehouse_id     INT UNSIGNED NOT NULL,
    transaction_type VARCHAR(32) NOT NULL,
    quantity         INT NOT NULL,
    reference        VARCHAR(100) NULL,
    notes            VARCHAR(500) NULL,
    created_at       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by       INT UNSIGNED NULL,
    INDEX idx_inventory_transactions_product (product_id),
    INDEX idx_inventory_transactions_warehouse (warehouse_id),
    INDEX idx_inventory_transactions_type (transaction_type),
    CONSTRAINT fk_inventory_transactions_product_id_products FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_inventory_transactions_warehouse_id_warehouses FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_inventory_transactions_created_by_users FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS distributors (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    phone          VARCHAR(64) NOT NULL,
    region         VARCHAR(100) NOT NULL,
    created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uq_distributors_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sales_orders (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_code     VARCHAR(100) NOT NULL,
    distributor_id INT UNSIGNED NOT NULL,
    product_id     INT UNSIGNED NOT NULL,
    product_name   VARCHAR(255) NOT NULL,
    quantity       INT NOT NULL,
    total_value    DECIMAL(14,2) NOT NULL,
    order_date     DATETIME(6) NOT NULL,
    created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_sales_orders_code (order_code),
    INDEX idx_sales_orders_distributor (distributor_id),
    INDEX idx_sales_orders_product (product_id),
    CONSTRAINT uq_sales_orders_order_code UNIQUE (order_code),
    CONSTRAINT fk_sales_orders_distributor_id_distributors FOREIGN KEY (distributor_id)
        REFERENCES distributors(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_sales_orders_product_id_products FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
