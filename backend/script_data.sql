-- Sử dụng database
USE guidebook_system;

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
    alt_text VARCHAR(255),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
('User Management', 'fas fa-users', 1, TRUE);

-- Insert Categories (Level 1 and Level 2)
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active)
VALUES
(16, NULL, 'Getting Started', 'Introduction to user management basics', 1, TRUE),
(16, NULL, 'Managing Users', 'Learn how to manage system users', 2, TRUE),
(16, 2, 'Create User', 'Steps to create a new user', 1, TRUE),
(16, 2, 'Delete User', 'Steps to remove an existing user', 2, TRUE);

-- Insert Contents
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index)
VALUES
(1, 'Welcome to User Management', '<h2>Getting Started</h2><p>This section introduces the basics of managing users.</p>', 'This section introduces the basics of managing users.', TRUE, 1),
(2, 'Overview of Managing Users', '<h2>Managing Users</h2><p>This section explains how to manage system users effectively.</p>', 'This section explains how to manage system users effectively.', TRUE, 1),
(3, 'How to Create a User', '<h2>Create User</h2><p>To create a new user, go to the "Add User" form and fill in required details.</p>', 'To create a new user, go to the Add User form and fill in required details.', TRUE, 1),
(4, 'How to Delete a User', '<h2>Delete User</h2><p>To delete a user, open the user list, select a user, and click "Delete".</p>', 'To delete a user, open the user list, select a user, and click Delete.', TRUE, 1);

-- Insert Content History
INSERT INTO content_history (content_id, user_id, title, html_content, change_note)
VALUES 
(3, 1, 'How to Create a User', '<h2>Create User</h2><p>Initial draft created by admin.</p>', 'Initial draft created');

-- Insert Media Files
-- INSERT INTO media_files (content_id, filename, original_name, file_path, file_size, file_type, is_active)
-- VALUES
-- (3, 'guide_create_user.pdf', 'create_user_guide.pdf', '/uploads/guide_create_user.pdf', 204800, 'application/pdf', TRUE);


-- Data form file Order Management.pdf
-- ======================================

-- ======================================
-- 2. INSERT CATEGORIES
-- ======================================
-- Level 1
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active)
VALUES
(6, NULL, 'Create Sale Order', 'Steps to create a new Sale Order', 1, TRUE),
(6, NULL, 'Create PO Style Detail', 'Steps to create and manage PO wise style detail', 2, TRUE),
(6, NULL, 'Validation Process', 'Rules and validations for order process', 3, TRUE);

-- Level 2 under Create Sale Order
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active)
VALUES
(6, 1, 'Header Sale Order', 'Enter order header information', 1, TRUE),
(6, 1, 'Product Detail', 'Add product detail and images', 2, TRUE),
(6, 1, 'Size Chart Template', 'Select size chart template', 3, TRUE),
(6, 1, 'Change Status', 'Change status of Sale Order', 4, TRUE);

-- Level 2 under Create PO Style Detail
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active)
VALUES
(6, 2, 'New BPO Line Creation', 'Steps to create BPO line', 1, TRUE),
(6, 2, 'Copy PO', 'Duplicate PO information', 2, TRUE),
(6, 2, 'Enter Size Breakdown', 'Enter size breakdown by qty or ratio %', 3, TRUE),
(6, 2, 'BPO Status', 'Manage BPO statuses', 4, TRUE),
(6, 2, 'Order DTW', 'Delivery time window handling', 5, TRUE),
(6, 2, 'Material Lead Time', 'Track raw material lead time', 6, TRUE),
(6, 2, 'Production Lead Time', 'Track production lead time (PCD)', 7, TRUE);

-- Level 2 under Validation Process
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active)
VALUES
(6, 3, 'Product Detail Validation', 'Validation rules for product detail', 1, TRUE),
(6, 3, 'Size Chart Validation', 'Validation rules for size chart', 2, TRUE),
(6, 3, 'Order Status Detail', 'Validation rules for order statuses', 3, TRUE);

-- ======================================
-- 3. INSERT CONTENTS
-- ======================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index)
VALUES
(4, 'Create Header Sale Order', 
'<h2>Create Header Sale Order</h2><p>To create a new Sale Order: <br/>1. Click “+” or press Ctrl+N.<br/>2. Select Order Type (Bulk, Stock Lot, Sample, Virtual).<br/>3. System will auto-generate Order ID.<br/>4. Fill product class, order program, customer details, PO style, PO number, dates, and other required fields.<br/>5. Click Save.</p>', 
'Steps to create a Sale Order: Click +, select Order Type, system generates Order ID, fill details, Save.', TRUE, 1),
(5, 'Product Detail', 
'<h2>Product Detail</h2><p>After saving Sale Order, allocate product detail.<br/>Upload compulsory image/sketch.<br/>Allocate FG item and FG item colors with unit price and CM cost.<br/>System validates that Unit price ≥ CM cost.</p>', 
'Product detail requires image, FG item allocation, and color allocation. Unit price must be ≥ CM cost.', TRUE, 1),
(6, 'Size Chart Template', 
'<h2>Size Chart Template</h2><p>Select correct size chart template to enter size breakdown detail for the order.</p>', 
'Select size chart template before entering size breakdown.', TRUE, 1),
(7, 'Change Status for Sale Order', 
'<h2>Change Status</h2><p>Sale Order statuses: Delete, Cancelled, On Hold, Open, Closed.<br/>Use Action menu to change status (based on authorization).</p>', 
'Sale Order statuses: Delete, Cancelled, On Hold, Open, Closed.', TRUE, 1),
(8, 'New BPO Line Creation', 
'<h2>New BPO Line Creation</h2><p>Steps: Enter Order PO detail, select Color, Delivery Location, Packing Method, Delivery Mode, Confirmed Date, Delivery Dates, Production Month, Sale Month.<br/>Click Save.</p>', 
'Steps to create a new BPO line: enter details, select options, save.', TRUE, 1),
(9, 'Copy PO', 
'<h2>Copy PO</h2><p>Use Copy PO to duplicate existing PO information, edit, and save to save time.</p>', 
'Copy existing PO and edit to save time.', TRUE, 1),
(10, 'Enter Size Breakdown', 
'<h2>Enter Size Breakdown</h2><p>Two options: <br/>1. Enter by quantity.<br/>2. Enter by ratio %. System auto calculates qty.<br/>Validation: ratio % > 105% triggers warning.</p>', 
'Enter size breakdown by qty or ratio %. Validation checks ratio > 105%.', TRUE, 1),
(11, 'BPO Status', 
'<h2>BPO Status</h2><p>Statuses include OPEN, CONFIRMED, CANCELED. Each status has rules for modification, cancellation, or revision.</p>', 
'BPO statuses: OPEN, CONFIRMED, CANCELED.', TRUE, 1),
(12, 'Order DTW', 
'<h2>Order Delivery Time Window</h2><p>View start and complete delivery dates, production months allocated.<br/>System updates DTW ID if dates change significantly.</p>', 
'Order DTW defines delivery and production time windows.', TRUE, 1),
(13, 'Material Lead Time', 
'<h2>Material Lead Time</h2><p>Before approving BPO, user must enter RM lead time.<br/>System calculates estimated in-house material arrival.</p>', 
'Material lead time must be entered before approving BPO.', TRUE, 1),
(14, 'Production Lead Time', 
'<h2>Production Lead Time</h2><p>Based on material lead time, system proposes possible PCD (Production Completion Date). User can confirm target PCD.</p>', 
'System proposes PCD based on material lead time.', TRUE, 1),
(15, 'Validation: Product Detail', 
'<h2>Validation - Product Detail</h2><p>Must add product detail before entering BPO. Cannot remove if BPO exists.</p>', 
'Validation: product detail must exist before BPO.', TRUE, 1),
(16, 'Validation: Size Chart Template', 
'<h2>Validation - Size Chart</h2><p>Must add size chart before entering BPO. Cannot remove if BPO exists.</p>', 
'Validation: size chart must exist before BPO.', TRUE, 1),
(17, 'Validation: Order Status Detail', 
'<h2>Validation - Order Status</h2><p>Sale Orders statuses captured: OPEN, ON HOLD, CLOSED, CANCELED, DELETED.<br/>Each status has specific rules for modification.</p>', 
'Validation: Order statuses include OPEN, ON HOLD, CLOSED, CANCELED, DELETED.', TRUE, 1);
