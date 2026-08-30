CREATE TABLE IF NOT EXISTS inventory_categories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(300) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_inventory_category (society_id,name),
  CONSTRAINT fk_inventory_category_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  item_code VARCHAR(50) NOT NULL,
  item_name VARCHAR(180) NOT NULL,
  unit ENUM('NOS','KG','LTR','MTR','BOX','PACKET','SET') NOT NULL DEFAULT 'NOS',
  current_stock DECIMAL(14,3) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(14,3) NOT NULL DEFAULT 0,
  reorder_quantity DECIMAL(14,3) NOT NULL DEFAULT 0,
  maximum_stock DECIMAL(14,3) NULL,
  last_purchase_rate DECIMAL(14,2) NULL,
  location VARCHAR(150) NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_inventory_item_code (society_id,item_code),
  KEY idx_inventory_low_stock (society_id,status,current_stock,minimum_stock),
  CONSTRAINT fk_inventory_item_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_item_category FOREIGN KEY(category_id) REFERENCES inventory_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  item_id BIGINT UNSIGNED NOT NULL,
  transaction_number VARCHAR(50) NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_type ENUM('IN','OUT') NOT NULL,
  source_type ENUM('OPENING','PURCHASE','RETURN','CONSUMPTION','DAMAGE','WORK_ORDER','TRANSFER','OTHER') NOT NULL,
  quantity DECIMAL(14,3) NOT NULL,
  rate DECIMAL(14,2) NULL,
  total_amount DECIMAL(14,2) NULL,
  balance_after DECIMAL(14,3) NOT NULL,
  vendor_id BIGINT UNSIGNED NULL,
  work_order_id BIGINT UNSIGNED NULL,
  external_reference VARCHAR(100) NULL,
  notes VARCHAR(500) NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_inventory_transaction_number (society_id,transaction_number),
  KEY idx_inventory_transaction (society_id,item_id,transaction_date),
  CONSTRAINT fk_inventory_transaction_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_transaction_item FOREIGN KEY(item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_transaction_vendor FOREIGN KEY(vendor_id) REFERENCES society_vendors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_transaction_work_order FOREIGN KEY(work_order_id) REFERENCES vendor_work_orders(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_sequences (
  society_id BIGINT UNSIGNED PRIMARY KEY,
  next_transaction_number BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_inventory_sequence_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO permissions(permission_name,permission_code,module_name,description,status) VALUES
('View Inventory','society.inventory.view','inventory','View stock and transaction history','ACTIVE'),
('Manage Inventory Masters','society.inventory.manage','inventory','Manage categories and items','ACTIVE'),
('Record Stock Transactions','society.inventory.transact','inventory','Record stock inward and outward','ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY','TREASURER','ACCOUNTANT')
AND p.permission_code LIKE 'society.inventory.%'
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
