-- Purelight Database Setup
-- Run this script to create the database and table

-- Create database (run this as superuser)
-- CREATE DATABASE purelight_db;

-- Connect to purelight_db and run the following:

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Insert sample data (optional)
-- INSERT INTO contacts (name, email, message) VALUES 
-- ('John Doe', 'john@example.com', 'This is a test message'),
-- ('Jane Smith', 'jane@example.com', 'Another test message');

-- View the table structure
\d contacts;

-- View all contacts
SELECT * FROM contacts ORDER BY created_at DESC;
