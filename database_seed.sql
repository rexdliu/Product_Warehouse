BEGIN;

-- 产品分类
INSERT INTO product_categories (id, name, description, created_at) VALUES
  (1, '电子产品', '高频周转商品', NOW()),
  (2, '家具', '仓储与办公家具', NOW()),
  (3, '服装', '品牌服饰', NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- 产品
INSERT INTO products (id, name, sku, description, price, cost, category_id, image_url, is_active, created_at)
VALUES
  (1, 'iPhone 14 Pro 256G', 'APPL-IP14P-256', '旗舰手机，主要面向 B2B 经销商', 9999.00, 6999.00, 1, NULL, 1, NOW()),
  (2, 'Samsung Galaxy S23 128G', 'SAMS-GS23-128', '高性能安卓旗舰', 7999.00, 5599.00, 1, NULL, 1, NOW()),
  (3, '人体工学办公椅', 'FURN-OC-001', '适用于仓库调度与客服团队', 1299.00, 699.00, 2, NULL, 1, NOW()),
  (4, '仓储工作服 M 码', 'APPREL-WORK-M', '耐磨透气的日常作业服', 199.00, 85.00, 3, NULL, 1, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price), cost = VALUES(cost), category_id = VALUES(category_id);

-- 仓库
INSERT INTO warehouses (id, name, location, capacity, is_active, created_at) VALUES
  (1, '华东一号仓', '上海浦东新区', 1500, 1, NOW()),
  (2, '华北备货仓', '北京顺义', 900, 1, NOW())
ON DUPLICATE KEY UPDATE location = VALUES(location), capacity = VALUES(capacity);

-- 经销商
INSERT INTO distributors (id, name, contact_person, phone, region, created_at) VALUES
  (1, '环球科技供应商', '李女士', '13800010001', '华北美区', NOW()),
  (2, '欧洲电子配件公司', '王先生', '13900020002', '欧洲区', NOW())
ON DUPLICATE KEY UPDATE contact_person = VALUES(contact_person), phone = VALUES(phone), region = VALUES(region);

-- 用户（仓库管理员示例账号，密码：Warehouse@123）
INSERT INTO users (id, username, email, phone, hashed_password, is_active, is_superuser, theme, notifications, ai_settings, created_at)
VALUES
  (1, 'manager', 'manager@example.com', '13800019999', '$2b$12$w4GiLpspy4l1J6BaRx73CeJZhSL4BIC1YtO8HoBB.RPCjZxKv/.02', 1, 0, 'system', JSON_OBJECT(), JSON_OBJECT(), NOW())
ON DUPLICATE KEY UPDATE email = VALUES(email), phone = VALUES(phone), hashed_password = VALUES(hashed_password);

-- 库存
INSERT INTO inventories (id, product_id, warehouse_id, quantity, reserved_quantity, updated_at) VALUES
  (1, 1, 1, 28, 5, NOW()),
  (2, 2, 1, 46, 3, NOW()),
  (3, 3, 1, 12, 0, NOW()),
  (4, 4, 2, 85, 10, NOW())
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = VALUES(reserved_quantity), updated_at = VALUES(updated_at);

-- 销售订单
INSERT INTO sales_orders (id, order_code, distributor_id, product_id, product_name, quantity, total_value, order_date, created_at)
VALUES
  (1, 'SO-1001', 1, 1, 'iPhone 14 Pro 256G', 18, 179982.00, '2024-07-15', NOW()),
  (2, 'SO-1002', 2, 2, 'Samsung Galaxy S23 128G', 25, 199975.00, '2024-08-05', NOW()),
  (3, 'SO-1003', 1, 4, '仓储工作服 M 码', 60, 11940.00, '2024-08-18', NOW())
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), total_value = VALUES(total_value), order_date = VALUES(order_date);

COMMIT;
