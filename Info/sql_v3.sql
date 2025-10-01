-- guidebook_fullstack-- Sử dụng database
USE guidebook_fullstack;

-- ======================================
-- 1. XÓA TOÀN BỘ CÁC BẢNG (nếu tồn tại)
-- ======================================
DROP TABLE IF EXISTS content_images;
DROP TABLE IF EXISTS content_history;
DROP TABLE IF EXISTS media_files;
DROP TABLE IF EXISTS contents;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS modules;

-- ======================================
-- 2. TẠO LẠI CÁC BẢNG
-- ======================================

-- Bảng users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor') DEFAULT 'editor',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    create_update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng modules
CREATE TABLE modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,              -- Tên module hiển thị (VD: "User Management", "Reporting")
    icon VARCHAR(50),                        -- Icon class cho navbar (VD: "fas fa-users")
    order_index INT DEFAULT 0,               -- Thứ tự hiển thị trên navbar (số nhỏ hiện trước)
    is_active BOOLEAN DEFAULT TRUE,          -- Bật/tắt module (admin có thể ẩn module tạm thời)
    create_update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng categories 
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT NOT NULL,                  -- Thuộc module nào
    parent_id INT NULL,                      -- NULL = cấp 1, có giá trị = cấp 2 (con của category khác)
    title VARCHAR(200) NOT NULL,             -- Tiêu đề category hiển thị trên sidebar
    description TEXT,                        -- Mô tả ngắn về category này (tùy chọn)
    order_index INT DEFAULT 0,               -- Thứ tự hiển thị trong sidebar
    is_active BOOLEAN DEFAULT TRUE,          -- Ẩn/hiện category
    create_update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    -- Index cho performance khi query theo module
    INDEX idx_module_order (module_id, order_index)
);

-- Bảng contents: Lưu nội dung chính của mỗi category
CREATE TABLE contents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,                -- Thuộc category nào
    title VARCHAR(300) NOT NULL,             -- Tiêu đề bài viết (hiển thị ở đầu content area)
    html_content LONGTEXT,                   -- Nội dung HTML từ rich editor (có thể rất dài)
    plain_content TEXT,                      -- Nội dung text thuần (để search, tự động extract từ HTML)
    is_published BOOLEAN DEFAULT TRUE,       -- Draft = FALSE, Published = TRUE
    view_count INT DEFAULT 0,                -- Đếm số lượt xem (analytics đơn giản)
    order_index INT,                         -- Thứ tự hiển thị trong category (số nhỏ hiện trước)
    create_update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    -- Index cho performance khi lọc bài viết theo category và trạng thái
    INDEX idx_category_published (category_id, is_published)
);

-- Bảng content_history
CREATE TABLE content_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_id INT NOT NULL,
    user_id INT,
    title VARCHAR(300),
    html_content LONGTEXT,
    change_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    -- Index cho performance khi xem lịch sử
    INDEX idx_content_history (content_id, created_at)
);

-- Bảng content_images
CREATE TABLE content_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_id INT,
    image_url VARCHAR(500),
    caption VARCHAR(255),
    order_index INT DEFAULT 0,
    create_update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);
-- Bảng media_files
CREATE TABLE media_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_id INT,                          -- Thuộc content nào (NULL nếu là file chung)
    filename VARCHAR(255) NOT NULL,          -- Tên file lưu trên server (đã rename để tránh conflict)
    original_name VARCHAR(255) NOT NULL,     -- Tên file gốc do user upload
    file_path VARCHAR(500) NOT NULL,         -- Đường dẫn đầy đủ đến file
    file_size INT,                           -- Kích thước file (bytes)
    file_type VARCHAR(100),                  -- Loại file (image/jpeg, image/png, etc.)
    is_active BOOLEAN DEFAULT TRUE,          -- Đánh dấu file có còn được sử dụng không
    create_update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL,
    
    -- Index để tìm file theo content
    INDEX idx_content_files (content_id, is_active)
);



-- ======================================
-- 3. DỮ LIỆU MẪU (sample data)
-- ======================================
-- Insert Users
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES 
('admin', 'admin@example.com', 'hashed_password_123', 'admin', TRUE),
('editor1', 'editor1@example.com', 'hashed_password_456', 'editor', TRUE);

-- Insert Modules
INSERT INTO modules (name, icon, order_index, is_active) VALUES
('Organization', 'fas fa-building', 1, TRUE),
('System', 'fas fa-cogs', 2, TRUE),
('Finance', 'fas fa-dollar-sign', 3, TRUE),
('Costing', 'fas fa-calculator', 4, TRUE),
('Product Sampling', 'fas fa-vials', 5, TRUE),
('Order Management', 'fas fa-shopping-cart', 6, TRUE),
('Planning', 'fas fa-project-diagram', 7, TRUE),
('Material Management', 'fas fa-boxes', 8, TRUE),
('Inventory', 'fas fa-warehouse', 9, TRUE),
('Production', 'fas fa-industry', 10, TRUE),
('Quality', 'fas fa-check-circle', 11, TRUE),
('Sales and Distribution', 'fas fa-truck', 12, TRUE),
('MI Reports', 'fas fa-chart-bar', 13, TRUE),
('Configuration', 'fas fa-tools', 14, TRUE),
('Help', 'fas fa-question-circle', 15, TRUE),
('Test Management', 'fas fa-users', 16, TRUE);



-- ==============================
-- LEVEL 1 CATEGORIES
-- ==============================
INSERT INTO categories (id, module_id, parent_id, title, description, order_index, is_active) VALUES
(1, 6, NULL, 'Create Header Sale Order', 'Steps to create a new Sale Order in FXPRO', 1, TRUE),
(2, 6, NULL, 'Create PO Wise Style Detail', 'Steps to create and manage PO style details', 2, TRUE),
(3, 6, NULL, 'Validation Process', 'Rules and validations for order process', 3, TRUE);

-- ==============================
-- LEVEL 2 CATEGORIES
-- ==============================
-- Under 1. Create Sale Order
INSERT INTO categories (id, module_id, parent_id, title, description, order_index, is_active) VALUES
(4, 6, 1, 'Product Detail', 'Manage product details of Sale Order', 1, TRUE),
(5, 6, 1, 'Size Chart Template', 'Select and manage size chart template', 2, TRUE),
(6, 6, 1, 'Change Status for Sale Order', 'Change Sale Order statuses', 3, TRUE);

-- Under 2. Create PO Wise Style Detail
INSERT INTO categories (id, module_id, parent_id, title, description, order_index, is_active) VALUES
(7, 6, 2, 'New BPO Line Creation', 'Steps to create new BPO line', 1, TRUE),
(8, 6, 2, 'Copy PO', 'Duplicate existing PO information', 2, TRUE),
(9, 6, 2, 'Enter Size Breakdown', 'Enter breakdown by qty or ratio %', 3, TRUE),
(10, 6, 2, 'Copy Size Breakdown', 'Copy breakdown from another PO', 4, TRUE),
(11, 6, 2, 'BPO Status', 'Manage BPO statuses', 5, TRUE),
(12, 6, 2, 'Order DTW (Delivery Time Window)', 'Manage delivery time window', 6, TRUE),
(13, 6, 2, 'Material Lead Time', 'Manage raw material lead time', 7, TRUE),
(14, 6, 2, 'Production Lead Time (Target PCD)', 'Track production completion date', 8, TRUE);

-- Under 3. Validation Process
INSERT INTO categories (id, module_id, parent_id, title, description, order_index, is_active) VALUES
(15, 6, 3, 'Product Detail Validation', 'Validation rules for product detail', 1, TRUE),
(16, 6, 3, 'Size Chart Template Validation', 'Validation rules for size chart', 2, TRUE),
(17, 6, 3, 'Order Status Validation', 'Validation rules for order statuses', 3, TRUE);

-- ==============================
-- CONTENTS (Level 3 -> Content)
-- ==============================

-- 1. Create Header Sale Order (immediate content)
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(1, 'How to Create Header Sale Order',
'<h2>Create Header Sale Order</h2>
<p>Below is instruction how to create Sale order in FXPRO:<br/>
Step 1: Click “+” or Ctrl+N<br/>
Step 2: Select Order Type (Bulk, Stock Lot, Sample, Virtual)<br/>
System generates Order ID automatically<br/>
Step 3: Select Product Class<br/>
Step 4: Select Order Program (if available)<br/>
Step 5-7: Customer detail selection<br/>
Step 8: Segment detail (if any)<br/>
Step 9: Enter Order PO style<br/>
Step 10: Enter PO number<br/>
Step 11: Select Order Confirmed Date<br/>
Step 12: Currency (default USD)<br/>
Step 13: Price type (default FOB)<br/>
Step 14: Select Merchandiser<br/>
Step 15: Select Product Developer<br/>
Step 16: Add Note (if any)<br/>
Step 17: Select Factory Season<br/>
Step 18: Click Save</p>',
'Steps: Click +, select order type, system generates ID, fill details, save.', TRUE, 1);

-- 1.1 Product Detail -> Content from 1.2.1, 1.2.2, 1.2.3
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(4, 'Save Image',
'<p>After saving the Sale Order, user must upload image/sketch. Mandatory field.</p>',
'Upload compulsory image/sketch for Sale Order.', TRUE, 1),
(4, 'Allocate FG Item',
'<p>Select FG item for the Sale Order. Enter ratio (default 1). Save.</p>',
'Allocate FG item with ratio.', TRUE, 2),
(4, 'Allocate FG Item Color',
'<p>Select FG item color, enter unit price and CM cost. Validation: Unit price ≥ CM cost.</p>',
'Allocate FG color with price validation.', TRUE, 3);

-- 1.2 Size Chart Template
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(5, 'Size Chart Template',
'<p>Select correct size chart template before entering size breakdown.</p>',
'Select correct size chart template.', TRUE, 1);

-- 1.3 Change Status for Sale Order
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(6, 'Sale Order Statuses',
'<p>Status types: Delete, Cancelled, On Hold, Open, Closed. Change via Action menu based on authorization.</p>',
'Statuses: Delete, Cancelled, On Hold, Open, Closed.', TRUE, 1);

-- 2. PO Wise Style Detail (2.1, 2.2, 2.3.1…)
-- Example for Enter Size Breakdown (qty + ratio)
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(9, 'Enter Size Breakdown by Qty',
'<p>Select BPO line and add qty. Validation: MO qty ≥ Order qty.</p>',
'Enter size breakdown by qty.', TRUE, 1),
(9, 'Enter Size Breakdown by Ratio %',
'<p>Enter total qty and size-wise ratio %. System auto calculates qty. Validation: warning if total ratio > 105%.</p>',
'Enter size breakdown by ratio %. Warning if >105%.', TRUE, 2);

-- 2.5 BPO Status -> Each sub-status content
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(11, 'BPO Status OPEN',
'<p>User can revise except Color and Delivery term. Cannot cancel, only delete.</p>',
'BPO OPEN: revisable except Color/Delivery term.', TRUE, 1),
(11, 'BPO Status CONFIRMED',
'<p>Can revise PO Unit Price, PO Detail, Size amendment. System records revision ID.</p>',
'BPO CONFIRMED: allows revisions.', TRUE, 2),
(11, 'BPO Status CANCELED',
'<p>System allows cancel if not released to production.</p>',
'BPO CANCELED: allowed if not released.', TRUE, 3);

-- 3. Validation Process contents
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(15, 'Validation: Product Detail',
'<p>Must add product detail before BPO. Cannot remove if BPO exists.</p>',
'Product detail required before BPO.', TRUE, 1),
(16, 'Validation: Size Chart',
'<p>Must add size chart before BPO. Cannot remove if BPO exists.</p>',
'Size chart required before BPO.', TRUE, 1),
(17, 'Validation: Order Status',
'<p>Statuses: OPEN, ON HOLD, CLOSED, CANCELED, DELETED. Each with modification rules.</p>',
'Order statuses with specific rules.', TRUE, 1);

-- Insert Content History
INSERT INTO content_history (content_id, user_id, title, html_content, change_note)
VALUES 
(3, 1, 'How to Create a User', '<h2>Create User</h2><p>Initial draft created by admin.</p>', 'Initial draft created');