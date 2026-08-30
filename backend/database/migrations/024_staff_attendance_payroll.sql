CREATE TABLE IF NOT EXISTS society_staff (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  employee_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(180) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(150) NULL,
  designation VARCHAR(120) NOT NULL,
  employment_type ENUM('FULL_TIME','PART_TIME','CONTRACT') NOT NULL DEFAULT 'FULL_TIME',
  joining_date DATE NOT NULL,
  monthly_basic DECIMAL(14,2) NOT NULL DEFAULT 0,
  monthly_allowances DECIMAL(14,2) NOT NULL DEFAULT 0,
  monthly_deductions DECIMAL(14,2) NOT NULL DEFAULT 0,
  bank_name VARCHAR(150) NULL,
  account_number VARCHAR(50) NULL,
  ifsc_code VARCHAR(20) NULL,
  emergency_contact VARCHAR(20) NULL,
  address VARCHAR(500) NULL,
  status ENUM('ACTIVE','INACTIVE','LEFT') NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uk_society_employee_code(society_id,employee_code),
  KEY idx_society_staff_status(society_id,status,designation),
  CONSTRAINT fk_society_staff_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_attendance (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  staff_id BIGINT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  attendance_status ENUM('PRESENT','ABSENT','HALF_DAY','PAID_LEAVE','UNPAID_LEAVE','WEEKLY_OFF','HOLIDAY') NOT NULL,
  check_in TIME NULL,
  check_out TIME NULL,
  notes VARCHAR(300) NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_staff_attendance(staff_id,attendance_date),
  KEY idx_attendance_society_date(society_id,attendance_date,attendance_status),
  CONSTRAINT fk_staff_attendance_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_staff_attendance_staff FOREIGN KEY(staff_id) REFERENCES society_staff(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_payroll (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  society_id BIGINT UNSIGNED NOT NULL,
  staff_id BIGINT UNSIGNED NOT NULL,
  payroll_number VARCHAR(50) NOT NULL,
  payroll_month DATE NOT NULL,
  working_days DECIMAL(5,2) NOT NULL,
  present_days DECIMAL(5,2) NOT NULL DEFAULT 0,
  paid_leave_days DECIMAL(5,2) NOT NULL DEFAULT 0,
  absent_equivalent_days DECIMAL(5,2) NOT NULL DEFAULT 0,
  basic_amount DECIMAL(14,2) NOT NULL,
  allowance_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  loss_of_pay DECIMAL(14,2) NOT NULL DEFAULT 0,
  other_deduction DECIMAL(14,2) NOT NULL DEFAULT 0,
  gross_amount DECIMAL(14,2) NOT NULL,
  net_amount DECIMAL(14,2) NOT NULL,
  status ENUM('SUBMITTED','APPROVED','REJECTED','PAID') NOT NULL DEFAULT 'SUBMITTED',
  decision_note VARCHAR(500) NULL,
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  payment_date DATE NULL,
  payment_mode ENUM('CASH','CHEQUE','NEFT','RTGS','UPI','BANK_TRANSFER') NULL,
  payment_reference VARCHAR(100) NULL,
  paid_by BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_staff_payroll_month(staff_id,payroll_month),
  UNIQUE KEY uk_staff_payroll_number(society_id,payroll_number),
  KEY idx_staff_payroll_status(society_id,payroll_month,status),
  CONSTRAINT fk_staff_payroll_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_staff_payroll_staff FOREIGN KEY(staff_id) REFERENCES society_staff(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff_sequences (
  society_id BIGINT UNSIGNED PRIMARY KEY,
  next_employee_number BIGINT UNSIGNED NOT NULL DEFAULT 1,
  next_payroll_number BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_staff_sequence_society FOREIGN KEY(society_id) REFERENCES societies(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO permissions(permission_name,permission_code,module_name,description,status) VALUES
('View Staff','society.staff.view','staff','View staff, attendance and payroll','ACTIVE'),
('Manage Staff','society.staff.manage','staff','Create and manage society staff','ACTIVE'),
('Manage Attendance','society.staff.attendance','staff','Record staff attendance','ACTIVE'),
('Generate Payroll','society.staff.payroll.generate','staff','Generate monthly staff payroll','ACTIVE'),
('Approve Payroll','society.staff.payroll.approve','staff','Approve or reject staff payroll','ACTIVE'),
('Pay Payroll','society.staff.payroll.pay','staff','Record salary payment','ACTIVE')
ON DUPLICATE KEY UPDATE status='ACTIVE';

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code IN('SUPER_ADMIN','SOCIETY_ADMIN','CHAIRMAN','SECRETARY','TREASURER') AND p.permission_code LIKE 'society.staff.%'
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.role_code='ACCOUNTANT' AND p.permission_code IN('society.staff.view','society.staff.attendance','society.staff.payroll.generate','society.staff.payroll.pay')
ON DUPLICATE KEY UPDATE permission_id=VALUES(permission_id);
