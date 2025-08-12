-- Start a fresh DB
DROP DATABASE IF EXISTS rfid_db;
CREATE DATABASE rfid_db;
USE rfid_db;

CREATE USER IF NOT EXISTS 'rfid'@'%' IDENTIFIED BY 'rfidpass';
GRANT ALL PRIVILEGES ON rfid_db.* TO 'rfid'@'%';
FLUSH PRIVILEGES;

-- ----------------------------
-- STEP 1: Create tables (no FKs yet)
-- ----------------------------

CREATE TABLE IF NOT EXISTS init_flag (
    id INT PRIMARY KEY,
    has_initialized BOOLEAN
);

-- -- exit if init_flag exists
-- SELECT COUNT(*) INTO @flag_exists FROM init_flag WHERE id = 1;
-- IF @flag_exists > 0 THEN
--     SELECT 'Database already initialized. Exiting...' AS message;
--     LEAVE;
-- END IF;
-- Insert flag row
INSERT IGNORE INTO init_flag (id, has_initialized) VALUES (1, true);

CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    max_readers INT DEFAULT 10,
    max_cards INT DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rfid_reader_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    make VARCHAR(50),
    model VARCHAR(50),
    year VARCHAR(10),
    color VARCHAR(30),
    owner_name VARCHAR(100),
    owner_phone VARCHAR(15),
    owner_email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    registration_date DATE,
    insurance_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rfid_readers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    reader_group_id INT NULL,
    reader_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    ip_address VARCHAR(50),
    mac_address VARCHAR(50),
    is_online BOOLEAN DEFAULT TRUE,
    last_heartbeat DATETIME,
    configuration TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rfid_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    card_uid VARCHAR(50) UNIQUE NOT NULL,
    card_type ENUM('staff', 'vehicle', 'visitor', 'guest') NOT NULL,
    staff_id INT NULL,
    vehicle_id INT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    issued_at DATETIME,
    expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rfid_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    card_uid VARCHAR(50) NOT NULL,
    reader_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) DEFAULT 'scan',
    raw_data TEXT,
    is_authorized BOOLEAN DEFAULT TRUE,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT DEFAULT 1,
    error_type ENUM(
        'mqtt_parse_error',
        'database_error',
        'validation_error',
        'unknown_reader',
        'unknown_card',
        'general_error',
        'system_error',
        'parse_error'
    ) NOT NULL,
    error_message TEXT NOT NULL,
    raw_data JSON,
    source_topic VARCHAR(200),
    source_ip VARCHAR(50),
    stack_trace TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------
-- STEP 2: Insert data
-- ----------------------------

-- Tenants
INSERT INTO tenants (tenant_code, name, contact_email, contact_phone)
VALUES ('DEMO_TENANT', 'Demo Organization', 'admin@demo.com', '+1-555-0123');

SET @tenant_id = LAST_INSERT_ID();

-- Reader Groups
INSERT INTO rfid_reader_groups (tenant_id, group_name, description, location)
VALUES (@tenant_id, 'Main Building', 'Primary building access control', 'Building A');

SET @group_id = LAST_INSERT_ID();

-- Staff
INSERT INTO staff (tenant_id, employee_id, first_name, last_name, email, phone, department, position, hire_date)
VALUES
(@tenant_id, 'EMP001', 'John', 'Doe', 'john.doe@demo.com', '+1-555-0001', 'IT', 'Software Engineer', '2024-01-15'),
(@tenant_id, 'EMP002', 'Jane', 'Smith', 'jane.smith@demo.com', '+1-555-0002', 'HR', 'HR Manager', '2023-06-01');

-- Vehicles
INSERT INTO vehicles (tenant_id, license_plate, vehicle_type, make, model, year, color, owner_name, owner_phone, registration_date)
VALUES
(@tenant_id, 'ABC-123', 'car', 'Toyota', 'Camry', '2022', 'Blue', 'John Doe', '+1-555-0001', '2024-01-20');

-- RFID Readers
INSERT INTO rfid_readers (tenant_id, reader_group_id, reader_id, name, location, ip_address, is_online, last_heartbeat)
VALUES
(@tenant_id, @group_id, 'READER_001', 'Main Entrance', 'Building A - Main Door', '192.168.1.101', TRUE, NOW());

-- Fetch FK IDs
SET @staff_id = (SELECT id FROM staff WHERE employee_id = 'EMP001');
SET @vehicle_id = (SELECT id FROM vehicles WHERE license_plate = 'ABC-123');

-- RFID Cards
INSERT INTO rfid_cards (tenant_id, card_uid, card_type, staff_id, vehicle_id, description, is_active, issued_at)
VALUES
(@tenant_id, 'CARD1234', 'staff', @staff_id, NULL, 'John Doe Card', TRUE, NOW()),
(@tenant_id, 'VEHICLE123', 'vehicle', NULL, @vehicle_id, 'Vehicle Card', TRUE, NOW());

-- RFID Logs
INSERT INTO rfid_logs (tenant_id, card_uid, reader_id, event_type, is_authorized, notes)
VALUES
(@tenant_id, 'CARD1234', 'READER_001', 'entry', TRUE, 'John Entry');

-- ----------------------------
-- STEP 3: Add Foreign Keys (now that required data exists)
-- ----------------------------

ALTER TABLE rfid_reader_groups
    ADD CONSTRAINT fk_reader_groups_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE rfid_readers
    ADD CONSTRAINT fk_readers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_readers_group FOREIGN KEY (reader_group_id) REFERENCES rfid_reader_groups(id) ON DELETE SET NULL;

ALTER TABLE staff
    ADD CONSTRAINT fk_staff_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE vehicles
    ADD CONSTRAINT fk_vehicles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE rfid_cards
    ADD CONSTRAINT fk_cards_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_cards_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_cards_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;

ALTER TABLE rfid_logs
    ADD CONSTRAINT fk_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE error_logs
    ADD CONSTRAINT fk_errors_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
