-- ============================================================================
-- ZERIC PostgreSQL Database Schema
-- Tagline: Made Simpler And Much Faster
-- Module: Owner Desk, Staff Directory & Multi-Category Terminals
-- ============================================================================

-- 1. Businesses / Clinics / Saloons Table
CREATE TABLE IF NOT EXISTS businesses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,      -- 'saloon' | 'parlour' | 'clinic' | 'diagnostic_lab'
  gender_tag VARCHAR(50),             -- 'For Men' | 'For Women' | 'Doctors' | 'Pathology'
  address VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(120),
  rating NUMERIC(2, 1) DEFAULT 4.8,
  current_serving_token INT DEFAULT 0,
  total_tokens_today INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Owners, Staff, Doctors, Customers)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email_or_phone VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,          -- 'owner' | 'staff' | 'doctor' | 'customer'
  business_id VARCHAR(50) REFERENCES businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Staff & Doctor Profiles Table (With Dynamic Daily Working Shifts)
CREATE TABLE IF NOT EXISTS staff_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  business_id VARCHAR(50) REFERENCES businesses(id) ON DELETE CASCADE,
  role_title VARCHAR(100) NOT NULL,   -- e.g. 'Senior Stylist' or 'Consultant Pediatrician'
  specialty VARCHAR(150),
  experience_years INT DEFAULT 5,
  monday_shift VARCHAR(50) DEFAULT 'Morning (09:00 AM - 01:00 PM)',
  tuesday_shift VARCHAR(50) DEFAULT 'Evening (04:00 PM - 08:30 PM)',
  wednesday_shift VARCHAR(50) DEFAULT 'Morning (09:00 AM - 01:00 PM)',
  thursday_shift VARCHAR(50) DEFAULT 'Evening (04:00 PM - 08:30 PM)',
  friday_shift VARCHAR(50) DEFAULT 'Full Day (10:00 AM - 07:00 PM)',
  saturday_shift VARCHAR(50) DEFAULT 'Morning (09:00 AM - 02:00 PM)',
  sunday_shift VARCHAR(50) DEFAULT 'Off Day',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Queue Tokens & Appointments Table
CREATE TABLE IF NOT EXISTS queue_tokens (
  id VARCHAR(50) PRIMARY KEY,
  business_id VARCHAR(50) REFERENCES businesses(id) ON DELETE CASCADE,
  token_number INT NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  service_name VARCHAR(150) NOT NULL,
  assigned_staff_name VARCHAR(120),
  status VARCHAR(20) DEFAULT 'Waiting', -- 'Waiting' | 'Serving' | 'Completed' | 'Skipped'
  deposit_paid INT DEFAULT 50,
  balance_due INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
