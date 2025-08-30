-- Maritime Weather Engine Database Schema
-- This script sets up the required tables and relations for the system.

-- ============================
-- Users Table
-- ============================
-- Stores user login credentials and roles.
-- Roles: 'captain' or 'analyst'
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('captain','analyst') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- Vessels Table
-- ============================
-- Stores vessel details with optional assigned captain.
CREATE TABLE IF NOT EXISTS vessels (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    imo_number INT NOT NULL UNIQUE,
    captain_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL

    eco_speed_knots DECIMAL(5,2) DEFAULT 12.00, -- knots
    fuel_consumption_rate DECIMAL(10,4) DEFAULT 0.2000, -- tons per nautical mile at eco speed
);

-- ============================
-- Voyages Table
-- ============================
-- Stores voyage plans for vessels, including status and waypoints.
CREATE TABLE IF NOT EXISTS voyages (
    id VARCHAR(255) PRIMARY KEY,
    vessel_id VARCHAR(255) NOT NULL,
    status ENUM('planned','active','completed') NOT NULL DEFAULT 'planned',
    origin_port VARCHAR(255) NOT NULL,
    destination_port VARCHAR(255) NOT NULL,
    etd TIMESTAMP NULL,
    eta TIMESTAMP NULL,
    route_waypoints TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

-- ============================
-- Alerts Table
-- ============================
-- Stores system-generated alerts linked to voyages.
-- Includes severity, category, recommendations, and weather data.
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(255) PRIMARY KEY,
    voyage_id VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('info','warning','critical','emergency') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority INT DEFAULT 5,
    category VARCHAR(50) DEFAULT 'general',
    recommendations JSON NULL,
    weather_data JSON NULL,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id) ON DELETE CASCADE
);
