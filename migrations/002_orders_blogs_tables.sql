-- Migration: Add orders and blogs tables
-- This migration adds the orders and blogs tables to the database

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30),
    shipping_address TEXT,
    apartment VARCHAR(255),
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
    order_items JSON NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for orders table
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id CHAR(36) NOT NULL,
    tags JSON,
    featured_image MEDIUMTEXT,
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    views INT DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for blogs table
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);
CREATE INDEX idx_blogs_published_at ON blogs(published_at); 