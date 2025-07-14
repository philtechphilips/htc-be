-- Migration: 001_initial_schema.sql
-- Description: Initial database schema creation
-- Date: 2024-01-01

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    phoneNumber VARCHAR(30) NULL,
    address VARCHAR(255) NULL,
    street VARCHAR(255) NULL,
    apartment VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image MEDIUMTEXT,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image MEDIUMTEXT,
    category_id CHAR(36) NOT NULL,
    details TEXT,
    images JSON,
    isFeatured BOOLEAN NOT NULL DEFAULT 0,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    note TEXT,
    priority INT,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create contact table (if needed for contact form)
CREATE TABLE IF NOT EXISTS contact (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_isDeleted ON users(isDeleted);
CREATE INDEX idx_categories_isDeleted ON categories(isDeleted);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_isDeleted ON products(isDeleted);
CREATE INDEX idx_products_isFeatured ON products(isFeatured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_isDeleted ON cart(isDeleted);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_isDeleted ON wishlist(isDeleted);
CREATE INDEX idx_contact_email ON contact(email);
CREATE INDEX idx_contact_isRead ON contact(isRead); 