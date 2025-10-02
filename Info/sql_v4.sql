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

-- 

-- ===========================================
-- Categories in ORGANIZATION
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(1, NULL, 'Company Information', 'Manage organization company details', 1, TRUE),
(1, NULL, 'Work Calendar', 'Setup and manage organization work calendar', 2, TRUE);

-- ===========================================
-- Categories in SYSTEM
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(2, NULL, 'Exchange Rate', 'Manage exchange rates', 1, TRUE),
(2, NULL, 'UOM Conversion', 'Unit of Measure conversion setup', 2, TRUE),
(2, NULL, 'Warehouse Location Details', 'Setup warehouse locations', 3, TRUE),
(2, NULL, 'Master Attribute Values', 'Manage master attribute values', 4, TRUE),
(2, NULL, 'Attribute Value Link', 'Link attribute values', 5, TRUE),
(2, NULL, 'Service Attribute Values', 'Manage service attribute values', 6, TRUE),
(2, NULL, 'Size Chart', 'Setup size chart details', 7, TRUE),
(2, NULL, 'Color Chart', 'Setup color chart details', 8, TRUE),
(2, NULL, 'Product Item Mgmt.', 'Manage product items', 9, TRUE),
(2, NULL, 'FG Item Mgmt.', 'Manage finished goods items', 10, TRUE),
(2, NULL, 'Material Item Mgmt.', 'Manage material items', 11, TRUE),
(2, NULL, 'WH BIN Location Detail', 'Warehouse BIN location details', 12, TRUE),
(2, NULL, 'Work Notes - FO', 'Manage FO work notes', 13, TRUE);

-- ===========================================
-- Categories in FINANCE
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(3, NULL, 'Currency', 'Manage currency settings', 1, TRUE),
(3, NULL, 'Customer Detail', 'Manage customer financial details', 2, TRUE),
(3, NULL, 'Vendor Detail', 'Manage vendor financial details', 3, TRUE),
(3, NULL, 'Vendor Group', 'Manage vendor grouping', 4, TRUE);

-- ===========================================
-- Categories in COSTING
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(4, NULL, 'Target Costing', 'Manage target costing for orders', 1, TRUE),
(4, NULL, 'Order Budget Plan', 'Plan budget for orders', 2, TRUE),
(4, NULL, 'Order Costing', 'Manage detailed order costing', 3, TRUE);

-- ===========================================
-- Categories in PRODUCT SAMPLING
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(5, NULL, 'Style Sampling Management', 'Manage style sampling activities', 1, TRUE),
(5, NULL, 'Style Wash Cycle Process', 'Handle wash cycle process for samples', 2, TRUE),
(5, NULL, 'Sample Work Order Ack.', 'Acknowledge sample work orders', 3, TRUE),
(5, NULL, 'Sample Work Order Execution', 'Execute sample work orders', 4, TRUE),
(5, NULL, 'Track Sample Prod. Status', 'Track production status of samples', 5, TRUE),
(5, NULL, 'Internal QC Inspection', 'Perform internal quality inspection for samples', 6, TRUE),
(5, NULL, 'Sample Dispatching', 'Manage sample dispatching process', 7, TRUE),
(5, NULL, 'Sample Feedback And Approvals', 'Handle feedback and approvals for samples', 8, TRUE),
(5, NULL, 'Sample Status Tracking', 'Track status of samples', 9, TRUE),
(5, NULL, 'Sampling Material Detail', 'Manage sampling material details', 10, TRUE),
(5, NULL, 'Sampling Material Purchases', 'Manage purchases of sampling materials', 11, TRUE),
(5, NULL, 'Sampling Material PO', 'Manage purchase orders for sampling materials', 12, TRUE),
(5, NULL, 'Sampling Material Receipt', 'Track receipt of sampling materials', 13, TRUE),
(5, NULL, 'Sampling Material Issues', 'Track issues related to sampling materials', 14, TRUE);

-- ===========================================
-- Categories in ORDER MANAGEMENT
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(6, NULL, 'Block Order', 'Manage block orders', 1, TRUE),
(6, NULL, 'Block Order Entry', 'Enter details for block orders', 2, TRUE),
(6, NULL, 'Forecast Order Management', 'Handle forecast order management', 3, TRUE),
(6, NULL, 'Order Program', 'Manage order programs', 4, TRUE),
(6, NULL, 'Confirmed Order Management', 'Manage confirmed orders', 5, TRUE),
(6, NULL, 'Manufacturing Orders - NEW', 'Handle new manufacturing orders', 6, TRUE),
(6, NULL, 'Order Route Details', 'Manage order route details', 7, TRUE),
(6, NULL, 'Order Component Details', 'Manage order component details', 8, TRUE),
(6, NULL, 'Product Item SMV Detail', 'Manage product item SMV details', 9, TRUE),
(6, NULL, 'Order PO Shipment Detail', 'Manage PO shipment details for orders', 10, TRUE),
(6, NULL, 'Order Misc. Approvals', 'Handle miscellaneous order approvals', 11, TRUE),
(6, NULL, 'Order Production Status', 'Track production status of orders', 12, TRUE),
(6, NULL, 'MO Production Assign', 'Assign MO production tasks', 13, TRUE);

-- ===========================================
-- Categories in PLANNING
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(7, NULL, 'Event Frame Work', 'Define and manage planning event frameworks', 1, TRUE),
(7, NULL, 'Event Management', 'Manage planning events', 2, TRUE),
(7, NULL, 'Operations Scheduling', 'Schedule operations for planning', 3, TRUE),
(7, NULL, 'Order Scheduling', 'Manage scheduling of orders', 4, TRUE),
(7, NULL, 'Forecast Schedule', 'Manage forecast schedules', 5, TRUE),
(7, NULL, 'Sewing Planning Board', 'Plan sewing schedules and resources', 6, TRUE),
(7, NULL, 'Shipment Scheduling', 'Manage scheduling of shipments', 7, TRUE);

-- ===========================================
-- Categories in MATERIAL MANAGEMENT
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(8, NULL, 'BOM Template', 'Manage Bill of Material templates', 1, TRUE),
(8, NULL, 'BOM Structure', 'Define and manage BOM structures', 2, TRUE),
(8, NULL, 'BOM Estimation', 'Estimate BOM requirements', 3, TRUE),
(8, NULL, 'BOM Purchase Mapping', 'Map purchase items in BOM', 4, TRUE),
(8, NULL, 'Firm Material Purchase Order', 'Manage firm material purchase orders', 5, TRUE),
(8, NULL, 'Group Purchase Mapping', 'Manage group purchase mappings', 6, TRUE),
(8, NULL, 'Material Purchase Order', 'Manage material purchase orders', 7, TRUE),
(8, NULL, 'RM Quotation Tracking', 'Track raw material quotations', 8, TRUE),
(8, NULL, 'RM Quotation Management', 'Manage raw material quotations', 9, TRUE),
(8, NULL, 'Material Lead Time Management', 'Manage lead time for materials', 10, TRUE),
(8, NULL, 'MPO Approval List', 'List of MPO approvals', 11, TRUE),
(8, NULL, 'FOC MPO Confirmation List', 'Confirmation list of FOC MPO', 12, TRUE),
(8, NULL, 'Material Requirement Plan', 'Plan for material requirements', 13, TRUE),
(8, NULL, 'MRP-MO Prod Assign', 'Assign production based on MRP-MO', 14, TRUE),
(8, NULL, 'BOM Consumption Detail', 'Track BOM consumption details', 15, TRUE);

-- ===========================================
-- Categories in INVENTORY
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(9, NULL, 'Material Receipt Detail', 'Track details of material receipts', 1, TRUE),
(9, NULL, 'Goods Received Note', 'Record goods received notes', 2, TRUE),
(9, NULL, 'Material Replacement Received', 'Track received material replacements', 3, TRUE),
(9, NULL, 'Lot Batch Detail', 'Manage lot batch details', 4, TRUE),
(9, NULL, 'Lot Batch Allocation', 'Allocate lot batches', 5, TRUE),
(9, NULL, 'Material Transfer To Cut', 'Transfer material to cutting', 6, TRUE),
(9, NULL, 'Material Issue', 'Issue materials to production or other uses', 7, TRUE),
(9, NULL, 'Material Issue - MRN', 'Manage MRN-based material issues', 8, TRUE),
(9, NULL, 'Material Return To Stock', 'Return unused material to stock', 9, TRUE),
(9, NULL, 'Material Return To Vendor', 'Return materials back to vendor', 10, TRUE),
(9, NULL, 'Material Location Transfer', 'Transfer material between locations', 11, TRUE),
(9, NULL, 'Material Movements', 'Track material movement history', 12, TRUE),
(9, NULL, 'Material Obsolete', 'Mark obsolete materials', 13, TRUE),
(9, NULL, 'Material Re-allocation', 'Re-allocate materials for different usage', 14, TRUE),
(9, NULL, 'Material Stock Adjustment', 'Adjust stock levels for materials', 15, TRUE),
(9, NULL, 'Material Excess Return To Vendor', 'Return excess material to vendor', 16, TRUE),
(9, NULL, 'Approved Material Returns', 'Manage approved material returns', 17, TRUE),
(9, NULL, 'Material Stock Discontinued', 'Manage discontinued material stock', 18, TRUE),
(9, NULL, 'Excess RM Acknowledgement', 'Acknowledge excess raw material', 19, TRUE);

-- ===========================================
-- Categories in PRODUCTION
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(10, NULL, 'Cut Lay Plan RM Requisition', 'Manage cut lay plan raw material requisition', 1, TRUE),
(10, NULL, 'Material Requisition Note', 'Track material requisition notes', 2, TRUE),
(10, NULL, 'Excess RM Return Note', 'Manage return notes for excess raw materials', 3, TRUE),
(10, NULL, 'Cut Order Mngt - Component G', 'Manage cut orders and component groups', 4, TRUE),
(10, NULL, 'Marker Plan', 'Manage marker planning', 5, TRUE),
(10, NULL, 'Cut Lay Detail', 'Handle cut lay details', 6, TRUE),
(10, NULL, 'Cut Sheet', 'Manage cut sheets', 7, TRUE),
(10, NULL, 'Material Remnant Issues', 'Handle issues of material remnants', 8, TRUE),
(10, NULL, 'Cutting Sub Process IN', 'Track cutting subprocess IN', 9, TRUE),
(10, NULL, 'Cutting Sub Process Production', 'Track cutting subprocess production', 10, TRUE),
(10, NULL, 'Cutting Supermarket In', 'Manage cutting supermarket IN process', 11, TRUE),
(10, NULL, 'Sewing Bundle', 'Manage sewing bundles', 12, TRUE),
(10, NULL, 'Cutting Supermarket Out', 'Manage cutting supermarket OUT process', 13, TRUE),
(10, NULL, 'Sewing In', 'Track sewing IN process', 14, TRUE),
(10, NULL, 'Sewing WIP Bundle Management', 'Manage sewing WIP bundles', 15, TRUE),
(10, NULL, 'Sewing Transaction', 'Track sewing transactions', 16, TRUE),
(10, NULL, 'Sewing Out With Batch Tag', 'Track sewing out with batch tag', 17, TRUE),
(10, NULL, 'Customer Invoice', 'Manage customer invoices in production', 18, TRUE),
(10, NULL, 'FG Order Transfer', 'Transfer finished goods orders', 19, TRUE),
(10, NULL, 'FG Mics Issue', 'Manage miscellaneous finished goods issues', 20, TRUE);

-- ===========================================
-- Categories in QUALITY
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(11, NULL, 'Fabric Roll QC Management', 'Manage QC for fabric rolls', 1, TRUE),
(11, NULL, 'Lot Batch Inspection', 'Inspect lot batches for quality', 2, TRUE),
(11, NULL, 'Material Inspection', 'Inspect materials for defects and quality', 3, TRUE),
(11, NULL, 'RM Lab Testing', 'Conduct raw material lab testing', 4, TRUE),
(11, NULL, 'RM Lot Batch Grouping', 'Group raw material lot batches', 5, TRUE),
(11, NULL, 'Cut Component Inspection', 'Inspect cut components for defects', 6, TRUE),
(11, NULL, 'Sewing End-Line Inspection', 'Inspect sewing quality at end-line', 7, TRUE),
(11, NULL, 'Sewing QA Inspection', 'Conduct sewing QA inspection', 8, TRUE),
(11, NULL, 'Sewing AQL Inspection', 'Perform sewing AQL inspection', 9, TRUE),
(11, NULL, 'Fabric Inspection', 'Inspect fabrics for quality assurance', 10, TRUE),
(11, NULL, 'Lot Batch Damage Management', 'Manage lot batch damages', 11, TRUE),
(11, NULL, 'Quality Assurance Inspection', 'Perform QA inspections', 12, TRUE),
(11, NULL, 'PO QA Inspection Management', 'Manage QA inspections for purchase orders', 13, TRUE);

-- ===========================================
-- Categories in SALES AND DISTRIBUTION
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(12, NULL, 'Shipment Plan', 'Plan shipments and schedules', 1, TRUE),
(12, NULL, 'Pre-Shipment Packing Slip', 'Manage pre-shipment packing slips', 2, TRUE),
(12, NULL, 'FG Packing Acceptation', 'Manage finished goods packing acceptation', 3, TRUE),
(12, NULL, 'Packing Completion', 'Track and manage packing completion', 4, TRUE),
(12, NULL, 'Packing Slip Management', 'Manage packing slips for shipments', 5, TRUE),
(12, NULL, 'FG WH Acceptation', 'Warehouse acceptation of finished goods', 6, TRUE),
(12, NULL, 'Order PO FG Reallocation', 'Reallocate finished goods POs', 7, TRUE),
(12, NULL, 'FG Location Transfer', 'Transfer finished goods locations', 8, TRUE),
(12, NULL, 'FG Movements', 'Track movements of finished goods', 9, TRUE),
(12, NULL, 'Shipment Management', 'Manage shipment operations', 10, TRUE),
(12, NULL, 'Invoicing', 'Manage invoicing for sales and distribution', 11, TRUE);

-- ===========================================
-- Categories in MI REPORTS
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(13, NULL, 'Order Book', 'View and analyze order book reports', 1, TRUE),
(13, NULL, 'Order Analytics', 'Analytics reports for orders', 2, TRUE),
(13, NULL, 'Product Attributes Analysis', 'Analyze product attributes reports', 3, TRUE),
(13, NULL, 'Overall Order Performance Analysis', 'Overall performance analysis for orders', 4, TRUE),
(13, NULL, 'Vendor Scorecard', 'Vendor scorecard performance reports', 5, TRUE),
(13, NULL, 'BOM Status Analysis', 'Analyze Bill of Material status reports', 6, TRUE),
(13, NULL, 'FG Item Style List', 'Finished goods item style listing', 7, TRUE),
(13, NULL, 'Material Item Analysis', 'Analyze material items reports', 8, TRUE),
(13, NULL, 'MO Scheduling Status', 'Reports on MO scheduling status', 9, TRUE),
(13, NULL, 'Sewing Performance Dashboard', 'Dashboard for sewing performance', 10, TRUE);

-- ===========================================
-- Categories in CONFIGURATION
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(14, NULL, 'MY Favorites Menu', 'Manage user favorite menus', 1, TRUE),
(14, NULL, 'User List', 'Manage system users list', 2, TRUE),
(14, NULL, 'Email Groups', 'Manage email groups for notifications', 3, TRUE),
(14, NULL, 'Reset Password', 'Reset user passwords', 4, TRUE),
(14, NULL, 'Notification Email Config', 'Configure notification email settings', 5, TRUE);


-- Level 2 Categories under Block Order Entry (id=38)
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(6, 38, 'Block Order Entry', 'Overview of block order entry function', 1, TRUE),
(6, 38, 'How to view block order', 'View and filter block orders', 2, TRUE),
(6, 38, 'How to view edit version', 'View revision history of block orders', 3, TRUE);


-- ===========================================
-- Contents for Category 150: Block Order Entry (Lv2)
-- ===========================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(150, 'Overview - Block Order Entry',
'<h2>Block Order Entry</h2>
<p>Allows the factory to record and balance both <b>Forecast</b> and <b>Confirmed orders</b> throughout the year to ensure production capacity and maintain a stable workforce, support material and supply chain planning, optimize finance and machinery investment, create proactivity, and secure stable revenue growth.</p>
<p><b>Source:</b> FXPRO → ORDER MANAGEMENT → Work Area → Block Order Entry</p>',
'Block Order Entry helps factory manage forecast and confirmed orders, ensuring capacity, planning, finance optimization, and stable revenue.',
TRUE, 1),

(150, 'How to create Block Order',
'<h2>1.1 How to create Block Order</h2>
<ol>
<li>Click “+” to create new block order.</li>
<li>At <b>Description</b>: enter the name of block order.</li>
<li>At <b>Customer/Brand/Div./Season</b>: fill details as required.</li>
<li>At <b>Original Reserved Qty</b>: enter block order quantity, system updates <b>Latest Reserved Qty</b>. If user changes qty, update at Latest Reserved Qty.</li>
<li>Enter <b>Unit Price</b> → system auto sets CH cost = 10% of Unit Price; add CM Cost if available.</li>
<li>Enter <b>Block Confirmed Date</b>.</li>
<li>Enter <b>Reservation Timeline</b>.</li>
<li>Click Save.</li>
</ol>',
'Steps: Click +, enter description, customer info, reserved qty, unit price, dates, save.',
TRUE, 2),

(150, 'How to edit Block Order',
'<h2>1.2 How to edit Block Order</h2>
<ol>
<li>Select the line to edit in main screen.</li>
<li>Click the <b>Edit</b> button.</li>
<li>Update block order information.</li>
<li>Click Save.</li>
</ol>',
'Steps: select block order, click edit, update info, save.',
TRUE, 3);

-- ===========================================
-- Content for Category 151: How to view block order
-- ===========================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(151, 'How to view Block Order',
'<h2>2. How to view Block Order</h2>
<p>User can view block orders by accessing menu: ORDER MANAGEMENT → Block Order Entry. The screen displays list of block orders with details such as Customer, Brand, Season, Reserved Qty, Status, etc. Filters and search options can be applied.</p>',
'View block orders with details (customer, brand, qty, status) and use filters to search.',
TRUE, 1);

-- ===========================================
-- Content for Category 152: How to view edit version
-- ===========================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(152, 'How to view edit version',
'<h2>3. How to view edit version of Block Order Entry</h2>
<p>System allows user to view revision history of a block order. Each version shows changes in Reserved Qty, Price, Dates, and Status. Select block order → choose <b>View Edit Version</b> to see details.</p>',
'View revision history of block orders including qty, price, dates, status changes.',
TRUE, 1);




-- Categories Level 2 for Forecast Order Management (parent_id = 38)
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(6, 38, 'Forecast Order Management', 'Overview of forecast order management function', 1, TRUE),
(6, 38, 'How to view Forecast Order Management', 'View and filter forecast order details', 2, TRUE);


-- ===========================================
-- Contents for Category 153: Forecast Order Management
-- ===========================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(153, 'Overview - Forecast Order Management',
'<h2>Forecast Order Management</h2>
<p>The Forecast Order Management module allows factories to capture forecasted demand, balance it with production capacity, and manage planning for confirmed orders. This ensures production stability, proactive supply chain management, and financial optimization.</p>
<p><b>Menu:</b> FXPRO → Order Management → Work Area → Forecast Order Management</p>',
'Forecast Order Management helps factory balance forecasted orders with capacity, planning, and finance.',
TRUE, 1),

(153, 'How to create Forecast Order',
'<h2>1.1 How to create Forecast Order</h2>
<ol>
<li>Click “+” to create new forecast order.</li>
<li>Enter Customer, Brand, Season details as required.</li>
<li>Enter forecasted quantity → system auto calculates totals.</li>
<li>Enter unit price and currency.</li>
<li>Set Forecast Date and Reservation Timeline.</li>
<li>Click Save.</li>
</ol>',
'Steps: Click +, fill customer/brand/season, quantity, price, date, save.',
TRUE, 2),

(153, 'How to edit Forecast Order',
'<h2>1.2 How to edit Forecast Order</h2>
<ol>
<li>Select an existing forecast order from the list.</li>
<li>Click the Edit button.</li>
<li>Update details (customer, qty, price, date, etc.).</li>
<li>Click Save to confirm changes.</li>
</ol>',
'Steps: select forecast order, click edit, update info, save.',
TRUE, 3),

(153, 'How to delete Forecast Order',
'<h2>1.3 How to delete Forecast Order</h2>
<ol>
<li>Select the forecast order to delete.</li>
<li>Click Delete button from the action menu.</li>
<li>Confirm deletion. The record will be removed from the system.</li>
</ol>',
'Steps: select forecast order, click delete, confirm.',
TRUE, 4);

-- ===========================================
-- Contents for Category 154: How to view Forecast Order Management
-- ===========================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(154, 'How to view Forecast Order Management',
'<h2>2. How to view Forecast Order Management</h2>
<p>Users can view forecast orders via menu: Order Management → Forecast Order Management. The list screen shows forecasted orders with details such as Customer, Brand, Season, Quantity, Price, Status. Filters and search tools allow quick retrieval.</p>',
'View forecast orders list with details (customer, brand, season, qty, price, status) and use filters/search.',
TRUE, 1);


-- ===========================================
-- Categories Level 2 under Confirm Order Management (id=41)
-- ===========================================
INSERT INTO categories (module_id, parent_id, title, description, order_index, is_active) VALUES
(6, 41, 'Create Header Sale Order', 'Steps to create a new Sale Order', 1, TRUE),   -- id = 155
(6, 41, 'Create PO Wise Style Detail', 'Steps to create and manage PO style detail', 2, TRUE), -- id = 156
(6, 41, 'Validation Process', 'Rules and validations for order process', 3, TRUE);  -- id = 157

-- ===========================================
-- Contents for Category 155: Create Header Sale Order
-- ===========================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(155, 'Overview - Create Header Sale Order',
'<h2>Create Header Sale Order</h2>
<p>To create a new Sale Order, follow the steps below. This ensures all required information is entered correctly into the system.</p>',
'Overview: Steps to create a new Sale Order.', TRUE, 1),

(155, '1.1 Create Header Sale Order',
'<h2>1.1 Create Header Sale Order</h2>
<ol>
<li>Click “+” or press Ctrl+N to create new Sale Order.</li>
<li>System generates Order ID automatically.</li>
<li>Fill Product Class, Order Program, Customer Details, PO style, PO number, dates, etc.</li>
<li>Click Save to complete.</li>
</ol>',
'Steps: Create new Sale Order → system generates ID → fill details → Save.', TRUE, 2),

(155, '1.2 Product Detail',
'<h2>1.2 Product Detail</h2>
<p>After saving header, allocate product detail:</p>
<ul>
<li>Upload compulsory image/sketch.</li>
<li>Allocate FG item and colors with unit price & CM cost.</li>
<li>System validates Unit price ≥ CM cost.</li>
</ul>',
'Product detail requires image, FG item allocation, and price validation.', TRUE, 3),

(155, '1.3 Size Chart Template',
'<h2>1.3 Size Chart Template</h2>
<p>Select the correct size chart template before entering size breakdown detail.</p>',
'Select size chart template before entering size breakdown.', TRUE, 4),

(155, '1.4 Change Status',
'<h2>1.4 Change Status</h2>
<p>Sale Order statuses include: Delete, Cancelled, On Hold, Open, Closed. Use Action menu to change status (based on authorization).</p>',
'Sale Order statuses: Delete, Cancelled, On Hold, Open, Closed.', TRUE, 5);

-- ===========================================
-- Contents for Category 156: Create PO Wise Style Detail
-- ===========================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(156, 'Overview - PO Wise Style Detail',
'<h2>PO Wise Style Detail</h2>
<p>Used to create and manage style details for each purchase order.</p>',
'Overview of PO Wise Style Detail management.', TRUE, 1),

(156, '2.1 New BPO Line Creation',
'<h2>2.1 New BPO Line Creation</h2>
<p>Steps: Enter Order PO detail, select Color, Delivery Location, Packing Method, Delivery Mode, Confirmed Date, Delivery Dates, Production Month, Sale Month → Save.</p>',
'Steps to create new BPO line: enter details, select options, save.', TRUE, 2),

(156, '2.2 Copy PO',
'<h2>2.2 Copy PO</h2>
<p>Use Copy PO to duplicate existing PO information, then edit and save.</p>',
'Copy existing PO and edit to save time.', TRUE, 3),

(156, '2.3 Enter Size Breakdown',
'<h2>2.3 Enter Size Breakdown</h2>
<p>Two options:
<ol>
<li>Enter by quantity.</li>
<li>Enter by ratio % (system auto calculates qty).</li>
</ol>
Validation: ratio % > 105% triggers warning.</p>',
'Enter size breakdown by qty or ratio %. Validation >105% triggers warning.', TRUE, 4),

(156, '2.4 BPO Status',
'<h2>2.4 BPO Status</h2>
<p>Statuses include OPEN, CONFIRMED, CANCELED. Each has rules for modification, cancellation, revision.</p>',
'BPO statuses: OPEN, CONFIRMED, CANCELED.', TRUE, 5),

(156, '2.5 Order DTW',
'<h2>2.5 Order DTW</h2>
<p>Defines delivery time windows. System updates DTW ID if dates change significantly.</p>',
'Order DTW defines delivery and production windows.', TRUE, 6),

(156, '2.6 Material Lead Time',
'<h2>2.6 Material Lead Time</h2>
<p>User must enter raw material lead time before approving BPO. System calculates in-house material arrival.</p>',
'Material lead time must be entered before BPO approval.', TRUE, 7),

(156, '2.7 Production Lead Time',
'<h2>2.7 Production Lead Time</h2>
<p>Based on material lead time, system proposes Production Completion Date (PCD). User can confirm target PCD.</p>',
'System proposes PCD based on material lead time.', TRUE, 8);

-- ===========================================
-- Contents for Category 157: Validation Process
-- ===========================================
INSERT INTO contents (category_id, title, html_content, plain_content, is_published, order_index) VALUES
(157, 'Overview - Validation Process',
'<h2>Validation Process</h2>
<p>Defines validation rules that must be followed before finalizing order operations.</p>',
'Overview of validation process in Confirm Order Management.', TRUE, 1),

(157, '3.1 Product Detail Validation',
'<h2>3.1 Product Detail Validation</h2>
<p>Product detail must be added before entering BPO. Cannot be removed if BPO exists.</p>',
'Validation: product detail must exist before BPO.', TRUE, 2),

(157, '3.2 Size Chart Validation',
'<h2>3.2 Size Chart Validation</h2>
<p>Size chart must be added before entering BPO. Cannot be removed if BPO exists.</p>',
'Validation: size chart must exist before BPO.', TRUE, 3),

(157, '3.3 Order Status Validation',
'<h2>3.3 Order Status Validation</h2>
<p>Sale Orders statuses include OPEN, ON HOLD, CLOSED, CANCELED, DELETED. Each status has specific rules for modification.</p>',
'Validation: Order statuses include OPEN, ON HOLD, CLOSED, CANCELED, DELETED.', TRUE, 4);



