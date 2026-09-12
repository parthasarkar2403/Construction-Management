-- Construction ERP - Database Schema
-- Module 1: Projects
--
-- You do NOT have to run this file by hand. When the Flask backend
-- starts, it automatically creates this table for you (see backend/app.py,
-- the line "db.create_all()").
--
-- This file exists so you can:
--   1) See exactly what the table looks like.
--   2) Create the table manually if you ever want to, using psql or
--      a tool like pgAdmin / TablePlus / DBeaver.

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    client_name VARCHAR(200),
    location VARCHAR(200),
    status VARCHAR(50) DEFAULT 'Planning',
    start_date DATE,
    end_date DATE,
    budget NUMERIC(14, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- A few sample rows so the Projects page isn't empty the first time you run it.
-- Safe to delete any time from the app itself.
INSERT INTO projects (name, client_name, location, status, start_date, budget, description)
VALUES
    ('Riverside Apartments', 'Greenfield Homes Ltd', 'Austin, TX', 'In Progress', '2026-01-15', 2500000, '12-unit residential building'),
    ('Downtown Office Tower', 'Meridian Corp', 'Houston, TX', 'Planning', '2026-06-01', 8750000, '15-story commercial office tower')
ON CONFLICT DO NOTHING;
